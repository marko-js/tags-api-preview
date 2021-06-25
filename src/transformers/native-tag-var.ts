import { types as t } from "@marko/compiler";
import lifecycle from "./lifecycle";

export = (tag: t.NodePath<t.MarkoTag>) => {
  const { node } = tag;
  const tagVar = node.var;

  if (!tagVar) {
    return;
  }

  if (!t.isIdentifier(tagVar)) {
    throw tag.get("var").buildCodeFrameError("Tag variables on a native tag cannot be destructured.");
  }

  const meta = lifecycle.closest(tag);
  node.var = null;
  tag.pushContainer("attributes", t.markoAttribute("key", tagVar));
  tag.insertBefore(
    t.markoScriptlet([
      t.variableDeclaration("var", [
        t.variableDeclarator(tagVar, t.stringLiteral(`${meta.refIndex++}`)),
      ]),
    ])
  );

  for (const ref of tag.scope.getBinding(tagVar.name)!.referencePaths) {
    if (!ref.isUpdateExpression()) {
      ref.replaceWith(
        t.callExpression(
          t.memberExpression(meta.component, t.identifier("getEl")),
          [tagVar]
        )
      );
    }
  }
};
