import path from "path";
import { types as t } from "@marko/compiler";
import * as utils from "@marko/babel-utils";
import getAttr from "../../util/get-attr";

export = function transform(tag: t.NodePath<t.MarkoTag>) {
  const file = tag.hub.file;
  const defaultAttr = getAttr(tag, "default")!;
  const errorMessage =
    defaultAttr && tag.node.attributes.length > 1
      ? "only supports the 'default' attribute"
      : !tag.node.var
      ? "requires a tag variable"
      : tag.node.arguments
      ? "does not support arguments"
      : tag.node.body.params.length
      ? "does not support tag body parameters"
      : tag.node.body.body.length
      ? "does not support body content"
      : undefined;

  if (errorMessage) {
    throw tag.get("name").buildCodeFrameError(`The <get> tag ${errorMessage}.`);
  }

  if (!defaultAttr) {
    for (const name in tag.get("var").getBindingIdentifiers()) {
      for (const violation of tag.scope.getOwnBinding(name)!
        .constantViolations) {
        throw violation.buildCodeFrameError(
          "Cannot mutate the global context."
        );
      }
    }

    tag.replaceWith(
      t.markoScriptlet([
        t.variableDeclaration("const", [
          t.variableDeclarator(
            tag.node.var!,
            t.memberExpression(t.identifier("out"), t.identifier("global"))
          ),
        ]),
      ])
    );
    return;
  }

  let fromValue = defaultAttr.node.value;

  if (t.isStringLiteral(fromValue)) {
    const literalValue = fromValue.value;
    if (literalValue === ".") {
      fromValue = utils.importDefault(
        file,
        `./${path.basename(file.opts.sourceFileName as string)}`,
        "context"
      );
    } else if (literalValue.includes("/")) {
      fromValue = utils.importDefault(file, literalValue, "context");
    } else {
      const fromTag = utils.getTagDefForTagName(file, literalValue);

      if (fromTag) {
        fromValue = utils.importDefault(file, `<${literalValue}>`, "context");
      } else {
        throw defaultAttr.buildCodeFrameError(
          `<get> could not find provider matching "${literalValue}".`
        );
      }
    }

    defaultAttr.set("value", fromValue);
  }
};
