import { types as t } from "@marko/compiler";
import { importRuntimeDefault } from "../../util/import-runtime";
const supportedAttrNames = new Set(["onMount", "onUpdate", "onDestroy"]);

export = function translate(tag: t.NodePath<t.MarkoTag>) {
  const { file } = tag.hub;
  const properties: t.ObjectExpression["properties"] = [];

  let errorMessage = tag.node.var
    ? "does not support a tag variable"
    : tag.node.body.body.length
    ? "does not support body content"
    : tag.node.body.params.length
    ? "does not support tag body parameters"
    : tag.node.arguments?.length
    ? "does not support arguments"
    : undefined;

  if (!errorMessage) {
    for (const attr of tag.get("attributes")) {
      if (attr.isMarkoAttribute()) {
        if (!supportedAttrNames.has(attr.node.name)) {
          errorMessage = `does not support the "${attr.node.name}" attribute`;
          break;
        }

        properties.push(
          t.objectProperty(t.stringLiteral(attr.node.name), attr.node.value)
        );
      } else {
        errorMessage = `does not support ...spread attributes`;
        break;
      }
    }

    if (!properties.length && !errorMessage) {
      errorMessage = "requires an onMount, onUpdate or onDestroy attribute";
    }
  }

  if (errorMessage) {
    throw tag
      .get("name")
      .buildCodeFrameError(`The <lifecycle> tag ${errorMessage}.`);
  }

  if (file.markoOpts.output === "html") {
    tag.remove();
    return;
  }

  tag.replaceWith(
    t.expressionStatement(
      t.callExpression(
        importRuntimeDefault(file, "components/lifecycle", "lifecycle"),
        [
          (file as any)._componentInstanceIdentifier,
          t.objectExpression(properties),
        ]
      )
    )
  );
};
