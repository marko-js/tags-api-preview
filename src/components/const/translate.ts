import { types as t } from "@marko/compiler";
import getAttr from "../../util/get-attr";
import deepFreeze from "../../util/deep-freeze/transform";
import assertNoAssignments from "../../util/assert-no-assignments";

export default (tag: t.NodePath<t.MarkoTag>) => {
  const tagVar = tag.node.var!;
  const valueAttr = getAttr(tag, "value")!;
  const errorMessage = !tagVar
    ? "requires a tag variable to be assigned to"
    : !valueAttr
    ? "must be initialized with a value"
    : tag.node.attributes.length > 1
    ? "only supports the 'value' attribute"
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

  assertNoAssignments(tag.get("var") as t.NodePath<t.PatternLike>);

  tag.replaceWith(
    t.variableDeclaration("const", [
      t.variableDeclarator(
        tagVar,
        deepFreeze(tag.hub.file, valueAttr.node.value)
      ),
    ])
  );
};
