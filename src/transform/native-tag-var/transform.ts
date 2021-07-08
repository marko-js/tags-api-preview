import { types as t } from "@marko/compiler";
import { importDefault, isNativeTag } from "@marko/babel-utils";
import define from "../../util/define/transform";
import * as lifecycle from "../lifecycle";

export default {
  MarkoTag(tag: t.NodePath<t.MarkoTag>) {
    const {
      node,
      hub: { file },
    } = tag;
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
      t.callExpression(importDefault(file, __dirname, "createRef"), [
        t.identifier("component"),
        keyString,
      ])
    );

    tag.pushContainer("attributes", t.markoAttribute("key", keyString));
    node.var = null;
  },
} as t.Visitor;
