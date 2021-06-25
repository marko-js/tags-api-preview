import fs from "fs";
import path from "path";
import glob from "globby";
import { build } from "esbuild";

(async () => {
  const assets = [];
  const entryPoints = [];
  const srcdir = path.resolve("src");
  const outdir = path.resolve("dist");
  const files = await glob(["**", "!*.d.ts", "!**/__tests__"], {
    cwd: srcdir,
  });

  for (const file of files) {
    if (path.extname(file) === ".ts") {
      entryPoints.push(path.resolve(srcdir, file));
    } else {
      assets.push(file);
    }
  }

  await Promise.all([
    Promise.all(
      assets.map(async (file) => {
        const outfile = path.join(outdir, file);
        await fs.promises.mkdir(path.dirname(outfile), { recursive: true });
        await fs.promises.copyFile(path.join(srcdir, file), outfile);
      })
    ),
    build({
      outdir,
      entryPoints,
      format: "cjs",
      outbase: srcdir,
      target: ["es2019"],
    }),
  ]);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
