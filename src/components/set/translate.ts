import path from "path";
import { types as t } from "@marko/compiler";
import * as utils from "@marko/babel-utils";
import getAttr from "../../util/get-attr";

export = function translate(tag: t.NodePath<t.MarkoTag>) {
  const file = tag.hub.file;
  const defaultAttr = getAttr(tag, "default")!;
  const errorMessage = !defaultAttr
    ? "'default' attribute is required"
    : tag.node.attributes.length > 1
    ? "only supports the 'default' attribute"
    : tag.node.var
    ? "does not support a tag variable"
    : tag.node.arguments?.length
    ? "does not support arguments"
    : tag.node.body.params.length
    ? "does not support tag body parameters"
    : !tag.node.body.body.length
    ? "requires body content"
    : undefined;

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
