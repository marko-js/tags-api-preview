import { types as t } from "@marko/compiler";
import deepFreeze from "../../util/deep-freeze/transform";
import { closest } from "../../transformers/lifecycle";
import getAttr from "../../util/get-attr";

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

  if (server) {
    tag.replaceWith(
      t.variableDeclaration("const", [
        t.variableDeclarator(tagVar, deepFreeze(file, defaultAttr.node.value)),
      ])
    );
  } else {
    file.path.scope.crawl();

    const meta = closest(tag)!;
    const binding = tag.scope.getBinding(tagVar.name)!;

    binding.constantViolations.forEach((assignment) => {
      let setValue: t.Expression;

      if (assignment.isUpdateExpression()) {
        setValue = t.binaryExpression(
          assignment.node.operator === "++" ? "+" : "-",
          t.memberExpression(meta.state, tagVar, true),
          t.numericLiteral(1)
        );
      } else if (assignment.isAssignmentExpression()) {
        setValue =
          assignment.node.operator === "="
            ? deepFreeze(file, assignment.node.right)
            : t.binaryExpression(
                assignment.node.operator.slice(
                  0,
                  -1
                ) as t.BinaryExpression["operator"],
                t.memberExpression(meta.state, tagVar, true),
                deepFreeze(file, assignment.node.right)
              );
      } else {
        throw assignment.buildCodeFrameError("Unsupported update expression");
      }

      assignment.replaceWith(
        t.callExpression(
          t.memberExpression(meta.component, t.identifier("setState")),
          [tagVar, setValue]
        )
      );
    });

    binding.referencePaths.forEach((ref) => {
      if (!t.isUpdateExpression(ref.node)) {
        ref.replaceWith(t.memberExpression(meta.state, tagVar, true));
      }
    });

    const stateVar = t.variableDeclaration("var", [
      t.variableDeclarator(tagVar, t.stringLiteral("" + meta.stateIndex++)),
    ]);

    if (!defaultAttr) {
      tag.replaceWith(stateVar);
    } else {
      tag.replaceWithMultiple([
        stateVar,
        t.expressionStatement(
          t.logicalExpression(
            "&&",
            t.unaryExpression(
              "!",
              t.binaryExpression("in", tagVar, meta.state)
            ),
            t.assignmentExpression(
              "=",
              t.memberExpression(meta.state, tagVar, true),
              deepFreeze(file, defaultAttr.node.value)
            )
          )
        ),
      ]);
    }
  }
};
