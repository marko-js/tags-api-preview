import * as fs from "fs";
import * as path from "path";
import fixture from "../../fixture";

const UPDATE =
  process.env.UPDATE_SNAPSHOTS || process.argv.includes("--update");

const extractedExample = fs
  .readFileSync(path.resolve(__dirname, "../../../../README.md"), "utf-8")
  .split(
    `# Example

\`\`\`marko
`
  )
  .pop()
  .split("```")[0];

fs.writeFileSync(
  path.resolve(__dirname, "templates/README-example.marko"),
  extractedExample
);

const snapshotDir = path.resolve(__dirname, "__snapshots__/README-example");

const errorFiles = [
  "node.compile.error.expected.txt",
  "web.compile.error.expected.txt",
].map((filename) => path.join(snapshotDir, filename));

if (UPDATE) {
  errorFiles.forEach(
    (filepath) => fs.existsSync(filepath) && fs.unlinkSync(filepath)
  );
} else {
  errorFiles.forEach((filepath) => {
    if (fs.existsSync(filepath)) {
      throw new Error(`Example from README.md did not compile without generating an error file:
  ${filepath}
with contents:
  ${fs.readFileSync(filepath, "utf-8")}`);
    }
  });
}

describe("README example", fixture("./templates/README-example.marko"));
