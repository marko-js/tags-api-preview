import { importNamed, getTagDef, isNativeTag } from "@marko/babel-utils";
import { types as t } from "@marko/compiler";
import { Visitor } from "@marko/compiler/babel-types";
import { taglibId } from "../../../marko.json";
import { closest } from "../../transformers/lifecycle";
import getAttr from "../get-attr";
type DepsVisitorState =
  | { shallow?: undefined; deps?: Set<string> }
  | { shallow: true; deps?: true };

const fnVisitor = {
  Function(fn) {
    const parentTag = fn.findParent((parent) =>
      parent.isMarkoTag()
    ) as t.NodePath<t.MarkoTag>;

    if (!fn.isExpression() || !parentTag || isNativeTag(parentTag)) {
      return;
    }

    const state: DepsVisitorState & { deps?: Set<string> } = {};
    fn.skip();
    fn.traverse(depsVisitor, state);

    if (state.deps) {
      const { file } = fn.hub;
      const { component } = closest(parentTag)!;

      fn.replaceWith(
        t.logicalExpression(
          "||",
          t.callExpression(importNamed(file, __dirname, "cached"), [
            component,
            ...Array.from(state.deps, toIdentifier),
          ]),
          t.callExpression(importNamed(file, __dirname, "cache"), [
            component,
            fn.node,
          ])
        )
      );
    }
  },
} as Visitor;

const depsVisitor = {
  ReferencedIdentifier: ((identifier, state) => {
    const { name } = identifier.node;
    const binding = identifier.scope.getBinding(name);
    if (binding) {
      const bindingTag = binding.path;

      if (bindingTag.isMarkoTag() && !isNativeTag(bindingTag)) {
        let isDep = false;

        if (isCoreTag(binding.path, "const")) {
          // Const tag reflects the default value as dependencies.
          const nestedState: DepsVisitorState = state.shallow
            ? state
            : { shallow: true };
          getAttr(bindingTag, "default")!.traverse(depsVisitor, nestedState);
          isDep = !!nestedState.deps;
        } else {
          isDep = true;
        }

        if (isDep) {
          if (state.shallow) {
            identifier.stop();
          } else {
            ((state.deps || (state.deps = new Set())) as Set<string>).add(
              identifier.node.name
            );
          }
        }
      }
    }
  }) as Visitor<DepsVisitorState>["Identifier"],
} as Visitor<DepsVisitorState>;

export = function transform(program: t.NodePath<t.Program>) {
  program.traverse(fnVisitor);
};

function isCoreTag(
  tag: t.NodePath,
  name: string
): tag is t.NodePath<t.MarkoTag> {
  if (tag.isMarkoTag()) {
    const def = getTagDef(tag);

    if (def && def.name === name && def.taglibId === taglibId) {
      return true;
    }
  }

  return false;
}

function toIdentifier(val: string) {
  return t.identifier(val);
}
