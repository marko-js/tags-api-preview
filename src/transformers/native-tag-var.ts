import { types as t } from "@marko/compiler";
import * as lifecycle from "./lifecycle";

export = (tag: t.NodePath<t.MarkoTag>) => {
  const { node } = tag;
  const tagVar = node.var;

  if (!tagVar) {
    return;
  }

  if (!t.isIdentifier(tagVar)) {
    throw tag
      .get("var")
      .buildCodeFrameError(
        "A tag variable on a native tag cannot be destructured."
      );
  }

  const meta = lifecycle.closest(tag)!;
  const keyString = t.stringLiteral(`${meta.refIndex++}`);
  node.var = null;
  tag.pushContainer("attributes", t.markoAttribute("key", keyString));
  tag.insertBefore(
    t.markoScriptlet([
      t.variableDeclaration("const", [
        t.variableDeclarator(
          tagVar,
          t.arrowFunctionExpression(
            [],
            t.callExpression(
              t.memberExpression(meta.component, t.identifier("getEl")),
              [keyString]
            )
          )
        ),
      ]),
    ])
  );
};
