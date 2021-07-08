import { types as t } from "@marko/compiler";
import { importDefault, isNativeTag } from "@marko/babel-utils";
import { closest } from "../lifecycle";
import isCoreTag from "../../util/is-core-tag";

type RootNodePath = t.NodePath<t.Program> | t.NodePath<t.MarkoTagBody>;

enum ScopeRelation {
  Same,
  Before,
  After,
}

enum ReferenceType {
  Sync,
  Async,
  Unknown,
}

export default {
  MarkoTag: {
    exit(tag: t.NodePath<t.MarkoTag>) {
      if (!tag.node.var) {
        return;
      }

      const {
        scope,
        hub: { file },
      } = tag;
      const tagVar = tag.get("var");
      const initializers: t.Statement[] = [];
      const meta = closest(tag.parentPath)!;

      for (const name in tagVar.getBindingIdentifiers()) {
        const binding = scope.getBinding(name);
        if (binding && binding.scope !== scope) {
          const alias = binding.scope.generateUidIdentifierBasedOnNode(
            binding.identifier
          );

          let hasHoistedRefs = false;
          let maybeHasSyncRefsBefore = false;

          for (const ref of binding.referencePaths) {
            switch (getScopeRelation(binding.scope, tag, ref)) {
              case ScopeRelation.After:
                hasHoistedRefs = true;
                break;
              case ScopeRelation.Before: {
                hasHoistedRefs = true;
                switch (getReferenceType(ref)) {
                  case ReferenceType.Async:
                    break;
                  case ReferenceType.Sync:
                    throw ref.buildCodeFrameError(
                      `Cannot access '${name}' before initialization.`
                    );
                  case ReferenceType.Unknown:
                    maybeHasSyncRefsBefore = true;
                    ref.replaceWith(
                      t.callExpression(ref.node as t.Identifier, [])
                    );
                    break;
                }
                break;
              }
            }
          }

          if (maybeHasSyncRefsBefore) {
            initializers.push(
              t.expressionStatement(
                t.callExpression(alias, [meta.component, binding.identifier])
              )
            );
          }

          if (hasHoistedRefs) {
            initializers.push(
              t.expressionStatement(
                t.assignmentExpression("=", alias, binding.identifier)
              )
            );

            tag.parentPath.parentPath.insertAfter(
              t.markoScriptlet([
                t.expressionStatement(
                  t.assignmentExpression("=", binding.identifier, alias)
                ),
              ])
            );
          }

          (binding.scope.path as RootNodePath).unshiftContainer(
            "body",
            t.markoScriptlet([
              t.variableDeclaration("var", [
                t.variableDeclarator(
                  binding.identifier,
                  maybeHasSyncRefsBefore
                    ? t.callExpression(
                        importDefault(file, __dirname, "hoist"),
                        [
                          closest(binding.scope.path as RootNodePath)!
                            .component,
                          t.stringLiteral(name),
                        ]
                      )
                    : null
                ),
                t.variableDeclarator(alias, binding.identifier),
              ]),
            ])
          );
        }
      }

      if (initializers.length) {
        tag.insertBefore(t.markoScriptlet(initializers));
      }
    },
  },
} as t.Visitor;

function getScopeRelation(scope: t.Scope, tag: t.NodePath, ref: t.NodePath) {
  const matchingScope = (parent: t.NodePath<any>) =>
    parent.scope === scope &&
    (parent.isMarkoScriptlet() ||
      parent.isMarkoPlaceholder() ||
      parent.isMarkoTag());
  const refParent = ref.findParent(matchingScope)!;
  const tagParent = tag.findParent(matchingScope)!;
  if (refParent.key === tagParent.key) {
    return ScopeRelation.Same;
  }

  return refParent.key < tagParent.key
    ? ScopeRelation.Before
    : ScopeRelation.After;
}

function getReferenceType(ref: t.NodePath) {
  let scope = ref.scope;

  // Special case iife's
  while (
    scope.path.key === "callee" &&
    scope.path.parentPath.isCallExpression()
  ) {
    scope = scope.parent;
  }

  if (t.isProgram(scope.block) || t.isMarkoTagBody(scope.block)) {
    return ReferenceType.Sync;
  }

  const closest = ref.findParent((parent) => parent.isMarkoAttribute());

  if (closest) {
    const closestTag = closest.parentPath as t.NodePath<t.MarkoTag>;

    if (
      isNativeTag(closestTag) ||
      isCoreTag("effect", closestTag) ||
      isCoreTag("lifecycle", closestTag)
    ) {
      return ReferenceType.Async;
    }
  }

  return ReferenceType.Unknown;
}
