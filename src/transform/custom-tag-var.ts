import { types as t } from "@marko/compiler";
import {
  isNativeTag,
  isDynamicTag,
  isAttributeTag,
  getTagDef,
} from "@marko/babel-utils";
import { closest } from "./wrapper-component";

export default {
  MarkoTag: {
    enter(tag) {
      if (!isCustomTagWithVar(tag)) {
        return;
      }

      const { node } = tag;
      const tagVar = node.var as t.PatternLike;
      const tagVarReplacement = t.objectPattern([
        t.objectProperty(t.identifier("default"), tagVar),
      ]);
      const meta = closest(tag.parentPath)!;
      const returnId = "_" + meta.varIndex++;
      const curValue = t.memberExpression(
        meta.component,
        t.identifier(returnId)
      );
      tag.set("var", tagVarReplacement);

      tag.pushContainer("attributes", [
        t.markoAttribute("_return", meta.component),
        t.markoAttribute("_returnId", t.stringLiteral(returnId)),
      ]);

      tag.insertBefore(
        t.markoScriptlet([
          t.variableDeclaration("let", [
            t.variableDeclarator(
              tagVarReplacement,
              t.logicalExpression(
                "||",
                curValue,
                t.assignmentExpression("=", curValue, t.objectExpression([]))
              )
            ),
          ]),
        ])
      );

      tag.insertAfter(
        t.markoScriptlet([
          t.expressionStatement(
            t.assignmentExpression("=", tagVarReplacement, curValue)
          ),
        ])
      );
    },
    exit(tag) {
      if (isCustomTagWithVar(tag)) {
        tag.node.var = null;
      }
    },
  },
} as t.Visitor;

function isCustomTagWithVar(tag: t.NodePath<t.MarkoTag>) {
  return (
    tag.node.var &&
    !(
      isNativeTag(tag) ||
      isAttributeTag(tag) ||
      isDynamicTag(tag) ||
      getTagDef(tag)?.translator
    )
  );
}
