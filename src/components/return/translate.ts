import { types as t } from "@marko/compiler";
const usedTag = new WeakSet<t.Hub>();

export = (tag: t.NodePath<t.MarkoTag>) => {
  let errorMessage = usedTag.has(tag.hub)
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

  let defaultAttr: t.NodePath<t.MarkoAttribute> | null = null;
  let defaultChangeAttr: t.NodePath<t.MarkoAttribute> | null = null;

  if (!errorMessage) {
    for (const attr of tag.get("attributes")) {
      if (attr.isMarkoAttribute()) {
        if (attr.node.name === "default") {
          defaultAttr = attr;
        } else if (attr.node.name === "defaultChange") {
          defaultChangeAttr = attr;
        } else {
          errorMessage = `does not support the "${attr.node.name}" attribute`;
          break;
        }
      } else {
        errorMessage = `does not support ...spread attributes`;
        break;
      }
    }
  }

  if (errorMessage) {
    throw tag
      .get("name")
      .buildCodeFrameError(`The <return> tag ${errorMessage}.`);
  }

  usedTag.add(tag.hub);

  const isHTML = tag.hub.file.markoOpts.output === "html";
  const returnDataId = tag.scope.generateUidIdentifier("return");
  const returnDataDefault = t.memberExpression(
    returnDataId,
    t.identifier("default")
  );
  const assignDefaultAttr = t.assignmentExpression(
    "=",
    returnDataDefault,
    defaultAttr!.node.value
  );
  const replacements: t.Statement[] = [
    t.variableDeclaration("var", [
      t.variableDeclarator(
        returnDataId,
        t.memberExpression(
          buildInputExpr("_return"),
          buildInputExpr("_returnId"),
          true
        )
      ),
    ]),
    isHTML
      ? t.expressionStatement(assignDefaultAttr)
      : t.ifStatement(
          t.binaryExpression("!==", returnDataDefault, assignDefaultAttr),
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(
                buildInputExpr("_return"),
                t.identifier("forceUpdate")
              ),
              []
            )
          )
        ),
  ];

  if (defaultChangeAttr) {
    replacements.push(
      t.expressionStatement(
        t.assignmentExpression(
          "=",
          t.memberExpression(returnDataId, t.identifier("defaultChange")),
          defaultChangeAttr.node.value
        )
      )
    );
  }

  tag.replaceWithMultiple(replacements);
};

function buildInputExpr(prop: string) {
  return t.memberExpression(t.identifier("input"), t.identifier(prop));
}
