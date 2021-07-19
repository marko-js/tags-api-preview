import { types as t } from "@marko/compiler";
import {
  isNativeTag,
  isDynamicTag,
  isAttributeTag,
  getTagDef,
} from "@marko/babel-utils";
import replaceAssignments from "../util/replace-assignments";
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

      visitBindingIdentifiers(
        tag.get("var") as t.NodePath<t.PatternLike>,
        (identifier) => {
          const binding = tag.scope.getBinding(identifier.node.name)!;
          const assignments = binding.constantViolations;
          if (assignments.length) {
            let changeKey: t.Expression;
            let parent = identifier.parentPath as t.NodePath<
              t.PatternLike | t.ObjectProperty
            >;

            if (parent.isRestElement()) {
              throw assignments[0].buildCodeFrameError(
                "Cannot assign to a ...rest element."
              );
            }

            if (parent.isAssignmentPattern()) {
              parent = parent.parentPath as t.NodePath<t.PatternLike>;
            }

            if (parent.isArrayPattern()) {
              throw assignments[0].buildCodeFrameError(
                "Assignment to a destructured array will come in a future version of the tags api preview."
              );
            }

            if (parent.isObjectProperty()) {
              const pattern = parent.parentPath as t.NodePath<t.ObjectPattern>;
              const key = parent.get("key");

              if (parent.node.computed) {
                changeKey = tag.scope.generateUidIdentifier(
                  `${identifier.node.name}Change`
                );
                pattern.pushContainer(
                  "properties",
                  t.objectProperty(
                    t.binaryExpression(
                      "+",
                      key.node,
                      t.stringLiteral("Change")
                    ),
                    changeKey,
                    true
                  )
                );
              } else if (key.isStringLiteral()) {
                const searchKey = `${key.node.value}Change`;
                for (const prop of pattern.get("properties")) {
                  if (prop.isObjectProperty()) {
                    const propKey = prop.get("key");
                    const propValue = prop.get("value");
                    if (
                      propKey.isStringLiteral() &&
                      propKey.node.value === searchKey &&
                      propValue.isIdentifier()
                    ) {
                      changeKey = propValue.node;
                      break;
                    }
                  }
                }

                if (!changeKey!) {
                  pattern.pushContainer(
                    "properties",
                    t.objectProperty(
                      t.stringLiteral(searchKey),
                      (changeKey = tag.scope.generateUidIdentifier(searchKey))
                    )
                  );
                }
              } else if (key.isIdentifier()) {
                const searchKey = `${key.node.name}Change`;
                for (const prop of pattern.get("properties")) {
                  if (prop.isObjectProperty()) {
                    const propKey = prop.get("key");
                    const propValue = prop.get("value");
                    if (
                      propKey.isIdentifier() &&
                      propKey.node.name === searchKey &&
                      propValue.isIdentifier()
                    ) {
                      changeKey = propValue.node;
                      break;
                    }
                  }
                }

                if (!changeKey!) {
                  pattern.pushContainer(
                    "properties",
                    t.objectProperty(
                      t.identifier(searchKey),
                      (changeKey = tag.scope.generateUidIdentifier(searchKey))
                    )
                  );
                }
              }
            }

            replaceAssignments(binding, (value) =>
              t.callExpression(changeKey, [value])
            );
          }
        }
      );

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

function visitBindingIdentifiers(
  path: t.NodePath<t.PatternLike>,
  fn: (identifier: t.NodePath<t.Identifier>) => void
): void {
  switch (path.node.type) {
    case "ObjectPattern":
      for (const prop of (path as t.NodePath<t.ObjectPattern>).get(
        "properties"
      )) {
        visitBindingIdentifiers(
          prop.isObjectProperty()
            ? (prop.get("value") as t.NodePath<t.PatternLike>)
            : (prop as t.NodePath<t.RestElement>),
          fn
        );
      }
      break;
    case "ArrayPattern":
      for (const el of (path as t.NodePath<t.ArrayPattern>).get("elements")) {
        visitBindingIdentifiers(el as t.NodePath<t.PatternLike>, fn);
      }
      break;
    case "RestElement":
      visitBindingIdentifiers(
        (path as t.NodePath<t.RestElement>).get(
          "argument"
        ) as t.NodePath<t.PatternLike>,
        fn
      );
      break;
    case "AssignmentPattern":
      visitBindingIdentifiers(
        (path as t.NodePath<t.AssignmentPattern>).get(
          "left"
        ) as t.NodePath<t.PatternLike>,
        fn
      );
      break;
    case "Identifier":
      fn(path as t.NodePath<t.Identifier>);
      break;
  }
}
