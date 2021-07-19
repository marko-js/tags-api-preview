import { types as t } from "@marko/compiler";
import deepFreeze from "../../util/deep-freeze/transform";
import { closest } from "../../transform/wrapper-component";
import replaceAssignments from "../../util/replace-assignments";

export = function translate(tag: t.NodePath<t.MarkoTag>) {
  const { file } = tag.hub;
  const server = file.markoOpts.output === "html";
  const tagVar = tag.node.var as t.Identifier;
  let defaultAttr!: t.NodePath<t.MarkoAttribute>;
  let changeAttr: t.NodePath<t.MarkoAttribute> | undefined;
  let errorMessage: string | undefined;

  for (const attr of tag.get("attributes")) {
    if (attr.isMarkoAttribute()) {
      switch (attr.node.name) {
        case "default":
          defaultAttr = attr;
          continue;
        case "defaultChange":
          changeAttr = attr;
          continue;
      }
    }

    errorMessage = `Unexpected attribute "${attr.toString()}"`;
    break;
  }

  errorMessage =
    errorMessage ||
    (!tagVar
      ? "requires a tag variable"
      : !t.isIdentifier(tagVar)
      ? "tag variable cannot be destructured"
      : !defaultAttr
      ? "must be initialized with a value"
      : tag.node.body.body.length
      ? "does not support body content"
      : tag.node.body.params.length
      ? "does not support tag body parameters"
      : tag.node.arguments?.length
      ? "does not support arguments"
      : undefined);

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
    const getStateExpr = t.conditionalExpression(
      t.binaryExpression("in", keyString, meta.state),
      t.memberExpression(meta.state, keyString, true),
      t.assignmentExpression(
        "=",
        t.memberExpression(meta.state, keyString, true),
        deepFreeze(file, defaultAttr.node.value)
      )
    );

    if (changeAttr) {
      const newValueId = tag.scope.generateUidIdentifier(tagVar.name);
      const changeFnId = tag.scope.generateUidIdentifier(
        `${tagVar.name}Change`
      );
      const setFnId = tag.scope.generateUidIdentifier(`${tagVar.name}Set`);

      tag.replaceWith(
        t.variableDeclaration("const", [
          t.variableDeclarator(changeFnId, changeAttr.node.value),
          t.variableDeclarator(
            setFnId,
            t.logicalExpression(
              "||",
              changeFnId,
              t.arrowFunctionExpression(
                [newValueId],
                t.callExpression(
                  t.memberExpression(meta.component, t.identifier("setState")),
                  [keyString, newValueId]
                )
              )
            )
          ),
          t.variableDeclarator(
            tagVar,
            t.conditionalExpression(
              changeFnId,
              defaultAttr.node.value,
              getStateExpr
            )
          ),
        ])
      );

      replaceAssignments(binding, (value) =>
        t.callExpression(setFnId, [value])
      );
    } else {
      tag.replaceWith(
        t.variableDeclaration("const", [
          t.variableDeclarator(tagVar, getStateExpr),
        ])
      );

      replaceAssignments(binding, (value) =>
        t.callExpression(
          t.memberExpression(meta.component, t.identifier("setState")),
          [keyString, value]
        )
      );
    }
  }
};
