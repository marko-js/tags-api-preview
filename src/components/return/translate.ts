import { types as t } from "@marko/compiler";
const usedTag = new WeakSet<t.Hub>();

export = (tag: t.NodePath<t.MarkoTag>) => {
  const errorMessage = usedTag.has(tag.hub)
    ? "can only be used once within a template"
    : tag.node.var
    ? "does not support a tag variable"
    : !tag.parentPath.parentPath.isProgram()
    ? "can only used at the root of the template"
    : !tag.node.attributes.length
    ? "requires a default attribute"
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
      .buildCodeFrameError(`The <return> tag ${errorMessage}.`);
  }

  usedTag.add(tag.hub);

  const props: t.ObjectExpression["properties"] = [];

  for (const attr of tag.get("attributes")) {
    if (attr.isMarkoAttribute()) {
      props.push(
        t.objectProperty(t.stringLiteral(attr.node.name), attr.node.value)
      );
    } else {
      props.push(t.spreadElement(attr.node.value));
    }
  }

  const returnInput = buildInputExpr("_return");
  tag.replaceWith(
    t.expressionStatement(
      t.logicalExpression(
        "&&",
        returnInput,
        t.callExpression(returnInput, [
          t.objectExpression(props),
          t.numericLiteral(1),
        ])
      )
    )
  );
};

function buildInputExpr(prop: string) {
  return t.memberExpression(t.identifier("input"), t.identifier(prop));
}
