import { types as t } from "@marko/compiler";
import { importDefault, isNativeTag } from "@marko/babel-utils";
import { closest } from "../wrapper-component";
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
          const hoistedId = binding.scope.generateUidIdentifier(
            `${binding.identifier.name}_hoisted`
          );

          let maybeHasSyncRefsBefore = false;
          const [assignment] = binding.constantViolations;

          if (assignment) {
            throw assignment.buildCodeFrameError(
              `Assigning to a hoisted tag variable is not supported in the tags api preview.`
            );
          }

          for (const ref of binding.referencePaths) {
            if (
              getScopeRelation(binding.scope, tag, ref) === ScopeRelation.Before
            ) {
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
                    t.assignmentExpression(
                      "=",
                      ref.node as t.Identifier,
                      t.callExpression(hoistedId, [])
                    )
                  );
                  break;
              }
            }
          }

          const hoistedDeclarators: t.VariableDeclarator[] = [
            t.variableDeclarator(binding.identifier),
          ];

          if (maybeHasSyncRefsBefore) {
            hoistedDeclarators.push(
              t.variableDeclarator(
                hoistedId,
                t.callExpression(importDefault(file, __dirname, "hoist"), [
                  closest(binding.scope.path as RootNodePath)!.component,
                  t.stringLiteral(name),
                  t.arrowFunctionExpression(
                    [t.identifier("_")],
                    t.assignmentExpression(
                      "=",
                      binding.identifier,
                      t.identifier("_")
                    )
                  ),
                ])
              )
            );
            initializers.push(
              t.expressionStatement(
                t.callExpression(hoistedId, [
                  meta.component,
                  binding.identifier,
                ])
              )
            );
          } else {
            hoistedDeclarators.push(
              t.variableDeclarator(
                hoistedId,
                t.arrowFunctionExpression(
                  [t.identifier("_")],
                  t.assignmentExpression(
                    "=",
                    binding.identifier,
                    t.identifier("_")
                  )
                )
              )
            );
            initializers.push(
              t.expressionStatement(
                t.callExpression(hoistedId, [binding.identifier])
              )
            );
          }

          (binding.scope.path as RootNodePath).unshiftContainer(
            "body",
            t.markoScriptlet([t.variableDeclaration("var", hoistedDeclarators)])
          );
        }
      }

      if (initializers.length) {
        (tag.parentPath as RootNodePath).pushContainer(
          "body",
          t.markoScriptlet(initializers)
        );
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
