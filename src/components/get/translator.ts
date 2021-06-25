import path from "path";
import { types as t } from "@marko/compiler";
import utils from "@marko/babel-utils";
import getAttr from "../../util/get-attr";

export = function translate(tag: t.NodePath<t.MarkoTag>) {
  const file = tag.hub.file;
  const tagVar = tag.node.var!;
  const defaultAttr = getAttr(tag, "default")!;
  const errorMessage = !defaultAttr
    ? "'default' attribute is required"
    : tag.node.attributes.length > 1
    ? "only supports the 'default' attribute"
    : !tagVar
    ? "requires a tag variable"
    : tag.node.arguments
    ? "does not support arguments"
    : tag.node.body.params.length
    ? "does not support tag body parameters"
    : tag.node.body.body.length
    ? "does not support body content"
    : undefined;

  if (errorMessage) {
    throw tag.get("name").buildCodeFrameError(`The <get> tag ${errorMessage}.`);
  }

  let fromValue = defaultAttr.node.value;

  if (t.isStringLiteral(fromValue)) {
    const literalValue = fromValue.value;
    if (literalValue === ".") {
      fromValue = utils.importDefault(
        file,
        `./${path.basename(file.opts.sourceFileName as string)}`,
        "context"
      );
    } else {
      const fromTag = utils.getTagDefForTagName(file, literalValue);

      if (fromTag) {
        fromValue = utils.importDefault(file, `<${literalValue}>`, "context");
      } else {
        throw defaultAttr.buildCodeFrameError(
          `<get> could not find provider matching "${literalValue}".`
        );
      }
    }

    defaultAttr.set("value", fromValue);
  }

  const body = tag.get("body");
  tag.node.var = null;
  body.pushContainer("params", tagVar);

  for (const sibling of tag.getAllNextSiblings()) {
    body.pushContainer("body", sibling.node);
    sibling.remove();
  }
};
