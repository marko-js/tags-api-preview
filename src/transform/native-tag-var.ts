import { types as t } from "@marko/compiler";
import { isNativeTag } from "@marko/babel-utils";
import define from "../util/define/transform";
import * as lifecycle from "../transform/lifecycle";

export default {
  MarkoTag(tag: t.NodePath<t.MarkoTag>) {
    const { node } = tag;
    const tagVar = node.var;

    if (!tagVar || !isNativeTag(tag)) {
      return;
    }

    if (!t.isIdentifier(tagVar)) {
      throw tag
        .get("var")
        .buildCodeFrameError(
          "A tag variable on a native tag cannot be destructured."
        );
    }

    const meta = lifecycle.closest(tag)!;
    const keyString = t.stringLiteral(`${meta.refIndex++}`);
    define(
      tag,
      meta,
      // TODO: should replace with a runtime that errors if called before mount.
      t.arrowFunctionExpression(
        [],
        t.callExpression(
          t.memberExpression(meta.component, t.identifier("getEl")),
          [keyString]
        )
      )
    );

    tag.pushContainer("attributes", t.markoAttribute("key", keyString));
    node.var = null;
  },
} as t.Visitor;
