import { types as t } from "@marko/compiler";
import { closest } from "../../transform/wrapper-component";
import assertNoAssignments from "../../util/assert-no-assignments";

export = function translate(tag: t.NodePath<t.MarkoTag>) {
  const tagVar = tag.node.var as t.Identifier;

  const errorMessage = !tagVar
    ? "requires a tag variable"
    : !t.isIdentifier(tagVar)
    ? "does not a destructured tag variable"
    : tag.node.attributes.length
    ? "does not support attributes"
    : tag.node.arguments
    ? "does not support arguments"
    : tag.node.body.params.length
    ? "does not support tag body parameters"
    : tag.node.body.body.length
    ? "does not support body content"
    : undefined;

  if (errorMessage) {
    throw tag.get("name").buildCodeFrameError(`The <id> tag ${errorMessage}.`);
  }

  assertNoAssignments(tag.get("var") as t.NodePath<t.PatternLike>);
  const meta = closest(tag.parentPath)!;

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
