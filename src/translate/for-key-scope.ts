import type { types as t } from "@marko/compiler";

export default {
  MarkoTag(tag) {
    const keyScope =
      (tag.node.name as t.StringLiteral).value === "for" &&
      tag.node.extra?.keyScope;
    if (keyScope) {
      // Copy keyScope that was calculated at transform time back now that we're in the translate phase.
      (tag.node as any).keyScope = keyScope;
    }
  },
} as t.Visitor;
