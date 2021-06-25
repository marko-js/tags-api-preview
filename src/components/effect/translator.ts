import path from "path";
import { types as t } from "@marko/compiler";
import { importDefault } from "@marko/babel-utils";
import getAttr from "../../util/get-attr";
const helperPath = path.join(__dirname, "helper");

export = function translate(tag: t.NodePath<t.MarkoTag>) {
  const { file } = tag.hub;

  if (file.markoOpts.output === "html") {
    tag.remove();
    return;
  }

  const depsAttr = getAttr(tag, "_deps")!;
  const args = [
    (file as any)._componentInstanceIdentifier,
    getAttr(tag, "default")!.node.value,
  ];

  if (depsAttr) {
    args.push(depsAttr.node.value);
  }

  tag.replaceWith(
    t.expressionStatement(
      t.callExpression(importDefault(file, helperPath, "effect"), args)
    )
  );
};

