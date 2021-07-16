import { types as t } from "@marko/compiler";
import getAttr from "../../util/get-attr";
import deepFreeze from "../../util/deep-freeze/transform";
import { closest } from "../../transform/wrapper-component";
import replaceAssignments from "../../util/replace-assignments";

export = function translate(tag: t.NodePath<t.MarkoTag>) {
  const { file } = tag.hub;
  const server = file.markoOpts.output === "html";
  const tagVar = tag.node.var as t.Identifier;
  const defaultAttr = getAttr(tag, "default")!;

  const errorMessage = !tagVar
    ? "requires a tag variable"
    : !t.isIdentifier(tagVar)
    ? "tag variable cannot be destructured"
    : !defaultAttr
    ? "must be initialized with a value"
    : tag.node.attributes.length > 1
    ? "only supports the 'default' attribute"
    : tag.node.body.body.length
    ? "does not support body content"
    : tag.node.body.params.length
    ? "does not support tag body parameters"
    : tag.node.arguments?.length
    ? "does not support arguments"
    : undefined;

  if (errorMessage) {
    throw tag.get("name").buildCodeFrameError(`The <let> tag ${errorMessage}.`);
  }

  file.path.scope.crawl();
  const binding = tag.scope.getBinding(tagVar.name)!;

  if (server || !binding.constantViolations.length) {
    file.path.scope.crawl();
    tag.replaceWith(
      t.variableDeclaration("const", [
        t.variableDeclarator(tagVar, deepFreeze(file, defaultAttr.node.value)),
      ])
    );
  } else {
    const meta = closest(tag.parentPath)!;
    const keyString = t.stringLiteral("" + meta.stateIndex++);

    tag.replaceWith(
      t.variableDeclaration("const", [
        t.variableDeclarator(
          tagVar,
          t.conditionalExpression(
            t.binaryExpression("in", keyString, meta.state),
            t.memberExpression(meta.state, keyString, true),
            defaultAttr
              ? t.assignmentExpression(
                  "=",
                  t.memberExpression(meta.state, keyString, true),
                  deepFreeze(file, defaultAttr.node.value)
                )
              : t.unaryExpression("void", t.numericLiteral(0))
          )
        ),
      ])
    );

    replaceAssignments(binding, (value) =>
      t.callExpression(
        t.memberExpression(meta.component, t.identifier("setState")),
        [keyString, value]
      )
    );
  }
};
