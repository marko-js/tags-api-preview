import fs from "fs";
import path from "path";
import glob from "fast-glob";
import { build, BuildOptions } from "esbuild";

const entryPoints = [];
const srcdir = path.resolve("src");
const outdir = path.resolve("dist");
const files = glob.stream(["**", "!*.d.ts", "!**/__tests__"], {
  cwd: srcdir,
}) as AsyncIterable<string>;

for await (const file of files) {
  if (path.extname(file) === ".ts") {
    entryPoints.push(path.resolve(srcdir, file));
  } else {
    const outfile = path.join(outdir, file);
    await fs.promises.mkdir(path.dirname(outfile), { recursive: true });
    await fs.promises.copyFile(path.join(srcdir, file), outfile);
  }
}

const opts: BuildOptions = {
  outdir,
  entryPoints,
  outbase: srcdir,
  platform: "node",
  target: ["es2019"],
  define: {
    "process.env.NODE_ENV": "'production'",
  },
};

await Promise.all([
  build({
    ...opts,
    format: "cjs",
  }),
  build({
    ...opts,
    format: "esm",
    bundle: true,
    splitting: true,
    outExtension: { ".js": ".mjs" },
    plugins: [
      {
        name: "external-modules",
        setup(build) {
          build.onResolve(
            { filter: /^[^./]|^\.[^./]|^\.\.[^/]/ },
            ({ path }) => ({
              path,
              external: true,
            })
          );
        },
      },
    ],
  }),
]);
