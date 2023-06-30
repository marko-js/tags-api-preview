import { types as t } from "@marko/compiler";

export default (path: t.NodePath<t.MarkoTag>) => {
  path.replaceWith(
    t.variableDeclaration("var", [
      t.variableDeclarator(
        t.identifier("componentDef"),
        (path.hub.file as any)._componentDefIdentifier
      ),
    ])
  );
};
