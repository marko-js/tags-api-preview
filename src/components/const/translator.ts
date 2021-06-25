import type { types } from "@marko/compiler";
import getAttr from "../../util/get-attr";
import deepFreeze from "../../util/deep-freeze/transform";

export = (tag: types.NodePath<types.MarkoTag>, t: typeof types) => {
  const tagVar = tag.node.var!;
  const defaultAttr = getAttr(tag, "default")!;
  const errorMessage = !tagVar
    ? "requires a tag variable to be assigned to"
    : !defaultAttr
    ? "must be initialized with a value"
    : tag.node.attributes.length > 1
    ? "only supports the 'default' attribute"
    : tag.node.body.body.length
    ? "does not support body content"
    : tag.node.body.params.length
    ? "does not support tag body parameters"
    : tag.node.arguments?.length
    ? "does not support arguments"
    : undefined;

  if (errorMessage) {
    throw tag
      .get("name")
      .buildCodeFrameError(`The <const> tag ${errorMessage}.`);
  }

  tag.replaceWith(
    t.variableDeclaration("const", [
      t.variableDeclarator(tagVar, deepFreeze(tag.hub.file, defaultAttr.node.value)),
    ])
  );
};
