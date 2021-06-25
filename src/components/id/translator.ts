import { types as t } from "@marko/compiler";
import { closest } from "../../transformers/lifecycle";

export = function translate(tag: t.NodePath<t.MarkoTag>) {
  const tagVar = tag.node.var;

  if (!tagVar) {
    throw tag
      .get("name")
      .buildCodeFrameError("<id> requires a tag variable to be assigned to.");
  }

  if (tag.get("attributes").length) {
    throw tag
      .get("name")
      .buildCodeFrameError("The <id> tag does not support attributes.");
  }

  if (tag.node.body.body.length) {
    throw tag
      .get("name")
      .buildCodeFrameError("The <id> tag does not support body content.");
  }

  const meta = closest(tag)!;

  tag.replaceWith(
    t.variableDeclaration("const", [
      t.variableDeclarator(
        tagVar,
        t.callExpression(
          t.memberExpression(meta.component, t.identifier("elId")),
          [t.stringLiteral(`@${meta.refIndex++}`)]
        )
      ),
    ])
  );
};
