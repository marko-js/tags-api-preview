import { types as t } from "@marko/compiler";
import deepFreeze from "../../util/deep-freeze/transform";
import { closest } from "../../transform/wrapper-component";
import replaceAssignments from "../../util/replace-assignments/transform";

export = function translate(tag: t.NodePath<t.MarkoTag>) {
  const { file } = tag.hub;
  const server = file.markoOpts.output === "html";
  const tagVar = tag.node.var as t.Identifier;
  let defaultAttr: t.NodePath<t.MarkoAttribute> | undefined;
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

    errorMessage = `does not support the "${attr.toString()}" attribute`;
    break;
  }

  errorMessage =
    errorMessage ||
    (!tagVar
      ? "requires a tag variable"
      : !t.isIdentifier(tagVar)
      ? "tag variable cannot be destructured"
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
  const defaultValue = defaultAttr
    ? defaultAttr.node.value
    : t.unaryExpression("void", t.numericLiteral(0));
  const binding = tag.scope.getBinding(tagVar.name)!;

  if (server) {
    file.path.scope.crawl();
    tag.replaceWith(
      t.variableDeclaration("const", [
        t.variableDeclarator(tagVar, deepFreeze(file, defaultValue)),
      ])
    );
  } else {
    const meta = closest(tag.parentPath)!;
    const keyString = t.stringLiteral("" + meta.stateIndex++);
    const newValueId = tag.scope.generateUidIdentifier(tagVar.name);
    const getStateExpr = t.conditionalExpression(
      t.binaryExpression("in", keyString, meta.state),
      t.memberExpression(meta.state, keyString, true),
      t.assignmentExpression(
        "=",
        t.memberExpression(meta.state, keyString, true),
        deepFreeze(file, defaultValue)
      )
    );

    if (changeAttr) {
      const changeFnId = tag.scope.generateUidIdentifier(
        `${tagVar.name}Change`
      );
      const decls: t.VariableDeclarator[] = [
        t.variableDeclarator(changeFnId, changeAttr.node.value),
      ];
      let setFnId: t.Identifier;

      if (t.isFunction(changeAttr.node.value)) {
        setFnId = changeFnId;
        decls.push(t.variableDeclarator(tagVar, defaultValue));
      } else {
        setFnId = tag.scope.generateUidIdentifier(`${tagVar.name}Set`);
        decls.push(
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
            t.conditionalExpression(changeFnId, defaultValue, getStateExpr)
          )
        );
      }

      tag.replaceWith(t.variableDeclaration("const", decls));

      replaceAssignments(binding, setFnId);
    } else {
      const setFnId = tag.scope.generateUidIdentifier(`${tagVar.name}Set`);
      tag.replaceWith(
        t.variableDeclaration("const", [
          t.variableDeclarator(tagVar, getStateExpr),
          t.variableDeclarator(
            setFnId,
            t.arrowFunctionExpression(
              [newValueId],
              t.callExpression(
                t.memberExpression(meta.component, t.identifier("setState")),
                [keyString, newValueId]
              )
            )
          ),
        ])
      );

      replaceAssignments(binding, setFnId);
    }
  }
};
