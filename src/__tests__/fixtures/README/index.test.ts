import * as fs from "fs";
import * as path from "path";
import fixture from "../../fixture";

//
// this fixture extracts all ```marko code blocks from markdown into temporary templates in order to detect compilation failure
//
// you may temporarily add scripts to your package.json for easier hacking on this file:
//
//  "scripts": {
//    "readme-test-update": "cross-env NODE_ENV=test mocha ./src/**/__tests__/**/readme/*.test.ts --update",
//    "readme-test": "cross-env NODE_ENV=test mocha ./src/**/__tests__/**/readme/*.test.ts",
//    ...
//  }
//
// or run those same commands using `npx` directly on the command line
//

const UPDATE =
  process.env.UPDATE_SNAPSHOTS || process.argv.includes("--update");

// this variable may be useful if in the future we want to update this fixture to check more than just the README markdown file
const testSlug = "README-fenced-code-blocks";
const testDescription = testSlug.replace(/-/g, " ");

const templateSlug = testSlug.slice(0, -1);
const templateDescription = templateSlug.replace(/-/g, " ");

const templateDirpath = path.join(__dirname, "templates");
const templateFilename = (index: string | number) =>
  `${templateSlug}-${index}.marko`;

const readmeFilepath = path.resolve(__dirname, "../../../../README.md");
const readmeContents = fs.readFileSync(readmeFilepath, "utf-8");

const fencedCodeBlockRegExp = new RegExp(/(?<=```marko)([\s\S]+?)(?=```\n)/g);
const extractedCodeBlocks = readmeContents.match(fencedCodeBlockRegExp)!;

const snapshotDirpath = path.join(__dirname, "__snapshots__", testSlug);
const errorFilenames = [
  "node.compile.error.expected.txt",
  "web.compile.error.expected.txt",
];

const templates: any[] = [];

// clear out any old template files generated on the previous run
fs.rmSync(templateDirpath, { force: true, recursive: true });
fs.mkdirSync(templateDirpath, { recursive: true });

// generate new temporary tamplate files based on extracted code blocks
extractedCodeBlocks.forEach((extractedCodeBlock, index) => {
  const templateFilepath = path.join(templateDirpath, templateFilename(index));

  fs.writeFileSync(templateFilepath, extractedCodeBlock);

  templates.push({
    slug: `${templateSlug}-${index}`,
    description: `${templateDescription} ${index}`,
    filename: templateFilename(index),
    filepath: templateFilepath,
    code: extractedCodeBlock,
  });
});

if (UPDATE) {
  // clear out any potential error files left over from any previous snapshot update
  fs.rmSync(snapshotDirpath, { force: true, recursive: true });
  fs.mkdirSync(snapshotDirpath, { recursive: true });
} else {
  // throw an error if any error files have appeared in the snapshot directory for the respective code block template
  // (this means the extracted code block does not compile and needs to be updated/fixed in the source markdown file)
  templates.forEach((template) => {
    errorFilenames.forEach((errorFilename) => {
      const filepath = path.join(snapshotDirpath, template.slug, errorFilename);
      if (fs.existsSync(filepath)) {
        throw new Error(`The markdown marko fenced code block:
  ${template.code}
found in:
  ${readmeFilepath}
did not compile without generating an error file:
  ${filepath}
with contents:
  ${fs.readFileSync(filepath, "utf-8")}`);
      }
    });
  });
}

describe(testDescription, () => {
  templates.forEach((template) => {
    describe(
      template.description,
      fixture(path.join("templates", template.filename)),
    );
  });
});
