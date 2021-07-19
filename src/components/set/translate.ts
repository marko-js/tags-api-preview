import path from "path";
import { types as t } from "@marko/compiler";
import * as utils from "@marko/babel-utils";

export = function translate(tag: t.NodePath<t.MarkoTag>) {
  const file = tag.hub.file;
  let errorMessage: string | undefined;

  for (const attr of tag.get("attributes")) {
    if (attr.isMarkoAttribute()) {
      switch (attr.node.name) {
        case "default":
        case "defaultChange":
          continue;
      }
    }

    errorMessage = `Unexpected attribute "${attr.toString()}"`;
    break;
  }

  errorMessage =
    errorMessage ||
    (tag.node.var
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
      utils.importDefault(
        file,
        `./${path.basename(file.opts.sourceFileName as string)}`,
        "context"
      )
    )
  );
};
