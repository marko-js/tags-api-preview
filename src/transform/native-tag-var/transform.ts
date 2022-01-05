import { types as t } from "@marko/compiler";
import { importDefault, isNativeTag, isDynamicTag } from "@marko/babel-utils";
import { closest } from "../wrapper-component";
import isCoreTag from "../../util/is-core-tag";

export default {
  MarkoTag: {
    enter(tag) {
      const {
        node,
        hub: { file },
      } = tag;
      const tagVar = node.var!;

      if (
        !(
          tagVar &&
          ((isNativeTag(tag) && !isCoreTag("style", tag)) || isDynamicTag(tag))
        )
      ) {
        return;
      }

      if (!t.isIdentifier(tagVar)) {
        throw tag
          .get("var")
          .buildCodeFrameError(
            "A tag variable on a native tag cannot be destructured."
          );
      }

      const meta = closest(tag.parentPath)!;
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

      tag.pushContainer("attributes", t.markoAttribute("key", keyString));
    },
    exit(tag) {
      if (tag.node.var && (isNativeTag(tag) || isDynamicTag(tag))) {
        // Don't remove the tag variable until it has been hoisted.
        tag.node.var = null;
      }
    },
  },
} as t.Visitor;
