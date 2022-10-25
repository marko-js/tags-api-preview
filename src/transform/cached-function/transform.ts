import { isNativeTag, isDynamicTag } from "@marko/babel-utils";
import { types as t } from "@marko/compiler";
import { importRuntimeNamed } from "../../util/import-runtime";
import isCoreTag from "../../util/is-core-tag";
import getAttr from "../../util/get-attr";
import isApi from "../../util/is-api";
import { ensureLifecycle } from "../wrapper-component";
type DepsVisitorState =
  | { root: t.NodePath; shallow?: undefined; deps?: Set<string> }
  | { root: t.NodePath; shallow: true; deps?: true };

const depsVisitor = {
  Function(fn, state) {
    if (fn === state.root) fn.skip();
  },
  ReferencedIdentifier: ((identifier, state) => {
    const { name } = identifier.node;
    const binding = identifier.scope.getBinding(name);
    if (binding) {
      const bindingTag = binding.path;

      if (
        bindingTag.isMarkoTag() &&
        !(isNativeTag(bindingTag) || isDynamicTag(bindingTag))
      ) {
        let isDep = false;

        if (isCoreTag("const", binding.path)) {
          // Const tag reflects the default value as dependencies.
          const nestedState: DepsVisitorState = state.shallow
            ? state
            : { root: state.root, shallow: true };
          getAttr(bindingTag, "default")!.traverse(depsVisitor, nestedState);
          isDep = !!nestedState.deps;
        } else {
          isDep = true;
        }

        if (isDep) {
          if (state.shallow) {
            state.deps = true;
            identifier.stop();
          } else {
            ((state.deps || (state.deps = new Set())) as Set<string>).add(
              identifier.node.name
            );
          }
        }
      }
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

    const state: DepsVisitorState & { deps?: Set<string> } = { root: fn };
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
                t.arrayExpression(
                  state.deps ? Array.from(state.deps, toIdentifier) : []
                ),
              ]
            ),
            fn.node
          ),
        ]
      )
    )[0].skip();
  },
} as t.Visitor;

function toIdentifier(val: string) {
  return t.identifier(val);
}
