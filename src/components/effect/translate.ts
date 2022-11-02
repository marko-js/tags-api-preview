import { types as t } from "@marko/compiler";
import { importRuntimeDefault } from "../../util/import-runtime";
import getAttr from "../../util/get-attr";

export = function translate(tag: t.NodePath<t.MarkoTag>) {
  const { file } = tag.hub;

  const valueAttr = getAttr(tag, "value")!;
  const errorMessage = tag.node.var
    ? "does not support a tag variable"
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
      .buildCodeFrameError(`The <effect> tag ${errorMessage}.`);
  }

  if (file.markoOpts.output === "html") {
    tag.remove();
    return;
  }

  tag.replaceWith(
    t.expressionStatement(
      t.callExpression(
        importRuntimeDefault(file, "components/effect", "effect"),
        [
          (file as any)._componentInstanceIdentifier,
          getAttr(tag, "value")!.node.value,
        ]
      )
    )
  );
};
