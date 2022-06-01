import fs from "fs";
import path from "path";
import glob from "fast-glob";

const HOOK = process.argv.at(-1) === "pre" ? "pre" : "post";

/**
 * Updates the `marko.json` fields between src & dist.
 */
await updateText("marko.json", async (src) =>
  HOOK === "pre"
    ? src.replace(/\/src\//g, "/dist/")
    : src.replace(/\/dist\//g, "/src/")
);

/**
 * Generates the `exports` field in the `package.json`.
 * This includes auto adding conditions to load `.mjs` vs `.js` and
 * supports the `browser` condition by looking for `-browser.ts` files.
 */
await updateJSON("package.json", async (data) => {
  if (HOOK === "post") {
    return {
      ...data,
      exports: undefined,
    };
  }

  const exportMap: any = {
    "./marko.json": "./marko.json",
  };

  const files = glob.stream([
    "dist/**",
    "!*.d.ts",
    "!**/__tests__",
    "!**/*.tsbuildinfo",
  ]) as AsyncIterable<string>;

  for await (const file of files) {
    const relativeFile = `./${file}`;
    const ext = path.extname(file);
    switch (ext) {
      case ".js": {
        const base = relativeFile.slice(0, -ext.length);
        const jsFile = `${base}.js`;
        const conditions = {
          import: `${base}.mjs`,
          default: jsFile,
        };
        const prev = exportMap[base];

        exportMap[base] = exportMap[jsFile] = prev
          ? Object.assign(prev, conditions)
          : conditions;

        if (prev) {
          exportMap[base] = exportMap[jsFile] = Object.assign(prev, conditions);
          continue;
        }

        exportMap[base] = exportMap[jsFile] = conditions;

        switch (path.basename(file, ext)) {
          case "index":
            exportMap[base.slice(0, -"/index".length)] = conditions;
            break;
          case "index-browser": {
            const parentBase = base.slice(0, -"-browser".length);
            const parentJSFile = `${parentBase}.js`;
            const parentDir = parentBase.slice(0, -"/index".length);
            const parentPrev = exportMap[parentBase];

            if (parentPrev) {
              exportMap[parentBase] =
                exportMap[parentJSFile] =
                exportMap[parentDir] =
                  {
                    browser: conditions,
                    ...(parentPrev as object),
                  };
            } else {
              exportMap[parentBase] =
                exportMap[parentJSFile] =
                exportMap[parentDir] =
                  {
                    browser: conditions,
                  };
            }
            break;
          }
        }
        break;
      }
      case ".mjs":
        break;
      default:
        exportMap[relativeFile] = relativeFile;
        break;
    }
  }

  return {
    ...data,
    exports: exportMap,
  };
});

async function updateJSON(
  file: string,
  update: (val: object) => Promise<unknown>
) {
  await updateText(file, async (src) =>
    JSON.stringify(await update(JSON.parse(src)), null, 2)
  );
}

async function updateText(
  file: string,
  update: (val: string) => Promise<string>
) {
  await fs.promises.writeFile(
    file,
    await update(await fs.promises.readFile(file, "utf-8"))
  );
}
