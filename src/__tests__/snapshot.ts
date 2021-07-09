import fs from "fs";
import path from "path";
import assert from "assert";
import { defaultSerializer, defaultNormalizer } from "@marko/fixture-snapshots";

const UPDATE =
  process.env.UPDATE_SNAPSHOTS || process.argv.includes("--update");

export default function snapshot(dir: string, file: string, rawData: unknown) {
  const parsed = path.parse(file);
  const snapshotDir = path.join(dir, "__snapshots__", parsed.dir);
  const ext = parsed.ext;
  let name = parsed.name;

  if (name) {
    name += ".";
  }

  fs.mkdirSync(snapshotDir, { recursive: true });

  const expectedFile = path.join(snapshotDir, `${name}expected${ext}`);
  const actualFile = path.join(snapshotDir, `${name}actual${ext}`);
  const data = format(rawData);

  if (UPDATE) {
    fs.writeFileSync(expectedFile, data, "utf-8");
  } else {
    const expected = fs.existsSync(expectedFile)
      ? fs.readFileSync(expectedFile, "utf-8")
      : "";

    try {
      assert.strictEqual(data, expected);
    } catch (err) {
      if ((rawData as any).stack) {
        throw rawData;
      }

      fs.writeFileSync(actualFile, data, "utf-8");
      err.stack = "";
      err.name = err.name.replace(" [ERR_ASSERTION]", "");
      err.message = path.relative(process.cwd(), actualFile);
      throw err;
    }
  }
}

function format(data: any) {
  if (data) {
    if ("nodeType" in data) {
      return defaultSerializer(defaultNormalizer(data));
    }

    if (data.stack) {
      // eslint-disable-next-line no-control-regex
      return data.message.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, "");
    }
  }

  return JSON.stringify(data);
}
