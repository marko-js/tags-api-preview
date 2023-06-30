import { types as t } from "@marko/compiler";

export default (path: t.NodePath<t.MarkoTag>) => {
  const {
    node,
    hub: { file },
  } = path;
  path
    .get("body")
    .unshiftContainer(
      "body",
      t.variableDeclaration("var", [
        t.variableDeclarator(
          (file as any)._componentDefIdentifier,
          node.body.params[0] as t.Identifier
        ),
        t.variableDeclarator(
          (file as any)._componentInstanceIdentifier,
          node.body.params[1] as t.Identifier
        ),
      ])
    );
};
