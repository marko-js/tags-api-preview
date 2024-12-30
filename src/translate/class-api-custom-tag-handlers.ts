import { types as t } from "@marko/compiler";
import { loadFileForTag } from "@marko/compiler/babel-utils";
import isApi from "../util/is-api";
const eventNameReg = /^on[A-Z]/;

// Translates all event handlers that are on class api child tags to use the `onEvent(handler)` api.
// This allows tags api templates to consume events from class api templates.
export default {
  MarkoTag(tag: t.NodePath<t.MarkoTag>) {
    if (isApi(tag, "class")) return;
    let childFile: t.BabelFile | undefined;

    for (const attr of tag.get("attributes")) {
      if (
        attr.isMarkoAttribute() &&
        !attr.node.arguments &&
        eventNameReg.test(attr.node.name)
      ) {
        if (
          !(childFile ||= loadFileForTag(tag)) ||
          isApi(childFile.path, "tags")
        )
          return;
        attr.node.arguments = [attr.node.value];
        attr.node.value = t.booleanLiteral(true);
      }
    }
  },
} as t.Visitor;
