import path from "path";
import { types as t } from "@marko/compiler";
import { importDefault } from "@marko/babel-utils";

export = function translate(tag: t.NodePath<t.MarkoTag>) {
  const file = tag.hub.file;
  let errorMessage: string | undefined;

  for (const attr of tag.get("attributes")) {
    if (attr.isMarkoAttribute()) {
      switch (attr.node.name) {
        case "value":
        case "valueChange":
          continue;
      }
    }

    errorMessage = `does not support the "${attr.toString()}" attribute`;
    break;
  }

  errorMessage =
    errorMessage ||
    (!tag.node.attributes.length
      ? "requires a value attribute"
      : tag.node.var
      ? "does not support a tag variable"
      : tag.node.arguments?.length
      ? "does not support arguments"
      : tag.node.body.params.length
      ? "does not support tag body parameters"
      : !tag.node.body.body.length
      ? "requires body content"
      : undefined);

  if (errorMessage) {
    throw tag.get("name").buildCodeFrameError(`The <set> tag ${errorMessage}.`);
  }

  tag.pushContainer(
    "attributes",
    t.markoAttribute(
      "___from",
      importDefault(
        file,
        `./${path.basename(file.opts.sourceFileName as string)}`,
        "context"
      )
    )
  );
};
