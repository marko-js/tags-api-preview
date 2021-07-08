import { types as t } from "@marko/compiler";
import { importDefault, isNativeTag } from "@marko/babel-utils";
import hoist from "../../util/hoist/transform";
import * as lifecycle from "../lifecycle";

export default {
  MarkoTag(tag: t.NodePath<t.MarkoTag>) {
    const {
      node,
      hub: { file },
    } = tag;
    const tagVar = node.var!;

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

    const meta = lifecycle.closest(tag.parentPath)!;
    const keyString = t.stringLiteral(`${meta.refIndex++}`);
    tag.insertBefore(
      t.markoScriptlet([
        t.variableDeclaration("const", [
          t.variableDeclarator(
            tagVar,
            t.callExpression(importDefault(file, __dirname, "createRef"), [
              meta.component,
              keyString,
            ])
          ),
        ]),
      ])
    );

    hoist(tag, meta);

    tag.pushContainer("attributes", t.markoAttribute("key", keyString));
    node.var = null;
  },
} as t.Visitor;
