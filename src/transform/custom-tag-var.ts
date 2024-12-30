import { types as t } from "@marko/compiler";
import {
  isNativeTag,
  isDynamicTag,
  isAttributeTag,
  getTagDef,
} from "@marko/compiler/babel-utils";
import { importRuntimeDefault } from "../util/import-runtime";
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
        t.objectProperty(t.identifier("value"), tagVar),
      ]);
      const meta = closest(tag.parentPath)!;
      const returnValueId = tag.scope.generateUidIdentifier(
        `${(tag.node.name as t.StringLiteral).value}Return`,
      );
      tag.set("var", tagVarReplacement);

      tag.pushContainer("attributes", [
        t.markoAttribute("_return", returnValueId),
      ]);

      tag.insertBefore(
        t.markoScriptlet([
          t.variableDeclaration("var", [
            t.variableDeclarator(
              returnValueId,
              t.callExpression(
                importRuntimeDefault(
                  tag.hub.file,
                  "components/return",
                  "return",
                ),
                [meta.component],
              ),
            ),
          ]),
        ]),
      );

      tag.insertAfter(
        t.markoScriptlet([
          t.variableDeclaration("const", [
            t.variableDeclarator(
              tagVarReplacement,
              t.callExpression(returnValueId, []),
            ),
          ]),
        ]),
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
