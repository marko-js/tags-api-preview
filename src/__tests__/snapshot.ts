import fs from "fs";
import path from "path";
import assert from "assert";
import { defaultSerializer, defaultNormalizer } from "@marko/fixture-snapshots";

const relatedErrors: Error[] = [];
const UPDATE =
  process.env.UPDATE_SNAPSHOTS || process.argv.includes("--update");

export default async function trySnapshot(
  dir: string,
  file: string,
  runner: (utils: {
    title(title: string): void;
    snapshot(ext: string, data: unknown): Promise<void>;
  }) => Promise<void>
) {
  const parsed = path.parse(file);
  const snapshotDir = path.join(dir, "__snapshots__", parsed.dir);
  let title = parsed.name;
  let existingFiles: Promise<string[]> | undefined;
  const utils: Parameters<typeof runner>[0] = {
    title(newTitle: string) {
      ensureNoErrors();
      title = `${parsed.name}.${newTitle}`;
    },
    async snapshot(ext, rawData) {
      ensureNoErrors();
      const expectedFile = path.join(snapshotDir, `${title}.expected.${ext}`);
      const actualFile = path.join(snapshotDir, `${title}.actual.${ext}`);
      const data = format(rawData);

      if (UPDATE) {
        await fs.promises.writeFile(expectedFile, data, "utf-8");
      } else {
        const expected = await fs.promises
          .readFile(expectedFile, "utf-8")
          .catch(noop);

        try {
          assert.strictEqual(data, expected);
        } catch (err) {
          if ((rawData as any).stack && expected === undefined) {
            throw rawData;
          }

          await fs.promises.writeFile(actualFile, data, "utf-8");
          err.stack = "";
          err.name = err.name.replace(" [ERR_ASSERTION]", "");
          err.message = path.relative(process.cwd(), actualFile);
          throw err;
        }
      }
    },
  };

  await fs.promises.mkdir(snapshotDir, { recursive: true });

  try {
    await runner(utils);
  } catch (err) {
    if (UPDATE) {
      await Promise.all(
        (
          await (existingFiles ||
            (existingFiles = fs.promises.readdir(snapshotDir)))
        )
          .filter((file) => file.includes(`${title}.expected.`))
          .map((file) => fs.promises.unlink(path.join(snapshotDir, file)))
      );
    }

    title += ".error";
    await utils.snapshot("txt", err);
  }
}

export function trackError(err: string | Error) {
  relatedErrors.push(typeof err === "string" ? new Error(err) : err);
}

function ensureNoErrors() {
  if (relatedErrors.length) {
    const err =
      relatedErrors.length > 1
        ? new Error(relatedErrors.map((err) => err.stack).join("\n"))
        : relatedErrors[0];
    relatedErrors.length = 0;
    throw err;
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

function noop() {}
