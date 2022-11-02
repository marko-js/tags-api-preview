import { isNativeTag, isDynamicTag } from "@marko/babel-utils";
import { types as t } from "@marko/compiler";
import { importRuntimeNamed } from "../../util/import-runtime";
import isApi from "../../util/is-api";
import { ensureLifecycle } from "../wrapper-component";

interface Deps {
  [x: string]: Deps | true;
}
interface DepsVisitorState {
  parentTag: t.NodePath;
  rootFn: t.NodePath;
  deps?: Deps;
}

const depsVisitor = {
  Function(fn, state) {
    if (fn === state.rootFn) fn.skip();
  },
  ReferencedIdentifier: ((identifier, state) => {
    let { name } = identifier.node;
    const binding = identifier.scope.getBinding(name);

    if (
      binding
        ? binding.path.isMarkoTag() &&
          !(
            binding.path === state.parentTag ||
            isNativeTag(binding.path) ||
            isDynamicTag(binding.path)
          )
        : name === "input"
    ) {
      let deps = state.deps || (state.deps = {});
      let parent = identifier.parentPath;

      do {
        const curDeps = deps[name];
        if (curDeps === true) return;

        if (
          parent.isMemberExpression() &&
          (!parent.node.computed ||
            isStringOrNumericLiteral(parent.node.property.type))
        ) {
          const prop = parent.node.property as
            | t.Identifier
            | t.StringLiteral
            | t.NumericLiteral;
          parent = parent.parentPath;
          deps = curDeps || (deps[name] = {} as Deps);
          name = prop.type === "Identifier" ? prop.name : prop.value + "";
        } else {
          deps[name] = true;
          return;
        }
        // eslint-disable-next-line no-constant-condition
      } while (true);
    }
  }) as t.Visitor<DepsVisitorState>["Identifier"],
} as t.Visitor<DepsVisitorState>;

export default {
  Function(fn) {
    if (isApi(fn, "class")) return;

    const parentTag = fn.findParent((parent) =>
      parent.isMarkoTag()
    ) as t.NodePath<t.MarkoTag>;

    if (!fn.isExpression() || !parentTag || isNativeTag(parentTag)) {
      return;
    }

    const state: DepsVisitorState = { rootFn: fn, parentTag };
    fn.skip();
    fn.traverse(depsVisitor, state);

    const { file } = fn.hub;
    const { component } = ensureLifecycle(parentTag as t.NodePath<t.MarkoTag>)!;

    fn.replaceWith(
      t.callExpression(
        importRuntimeNamed(file, "transform/cached-function", "cache"),
        [
          t.logicalExpression(
            "||",
            t.callExpression(
              importRuntimeNamed(file, "transform/cached-function", "cached"),
              [
                component,
                t.arrayExpression(state.deps ? toDepsArray(state.deps) : []),
              ]
            ),
            fn.node
          ),
        ]
      )
    )[0].skip();
  },
} as t.Visitor;

function isStringOrNumericLiteral(type: string) {
  switch (type) {
    case "StringLiteral":
    case "NumericLiteral":
      return true;
    default:
      return false;
  }
}

function toDepsArray(
  deps: Deps,
  object?: t.Expression,
  arr: (t.Identifier | t.MemberExpression)[] = []
) {
  for (const name in deps) {
    const dep = deps[name];
    const node = object
      ? t.memberExpression(object, t.stringLiteral(name), true)
      : t.identifier(name);

    if (dep === true) {
      arr.push(node);
    } else {
      toDepsArray(dep, node, arr);
    }
  }

  return arr;
}
