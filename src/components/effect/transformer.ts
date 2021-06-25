import { getTagDef, isNativeTag } from "@marko/babel-utils";
import { types as t } from "@marko/compiler";
import { Visitor } from "@marko/compiler/babel-types";
import { taglibId } from "../../../marko.json";
import getAttr from "../../util/get-attr";
type DepsVisitorState =
  | { shallow?: undefined; deps?: Set<string> }
  | { shallow: true; deps?: true };

const seen = new WeakSet();
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

export = function transform(tag: t.NodePath<t.MarkoTag>) {
  if (seen.has(tag)) {
    return;
  }

  seen.add(tag);

  const defaultAttr = getAttr(tag, "default")!;
  const errorMessage = tag.node.var
    ? "does not support a tag variable"
    : !defaultAttr
    ? "must be initialized with a value"
    : tag.node.attributes.length > 1
    ? "only supports the 'default' attribute"
    : tag.node.body.body.length
    ? "does not support body content"
    : tag.node.body.params.length
    ? "does not support tag body parameters"
    : tag.node.arguments?.length
    ? "does not support arguments"
    : undefined;

  if (errorMessage) {
    throw tag
      .get("name")
      .buildCodeFrameError(`The <effect> tag ${errorMessage}.`);
  }

  const state: DepsVisitorState & { deps?: Set<string> } = {};
  defaultAttr.get("value").traverse(depsVisitor, state);

  if (state.deps) {
    tag.pushContainer(
      "attributes",
      t.markoAttribute(
        "_deps",
        t.arrayExpression(Array.from(state.deps, (it) => t.identifier(it)))
      )
    );
  }
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
