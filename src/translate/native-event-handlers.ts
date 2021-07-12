import { types as t } from "@marko/compiler";
import { isNativeTag } from "@marko/babel-utils";
import isApi from "../util/is-api";
const eventNameReg = /^on[A-Z]/;

// TODO: warn when lowercased variants used and passed a non string
export default {
  MarkoTag(tag: t.NodePath<t.MarkoTag>) {
    if (isApi(tag, "tags") && isNativeTag(tag)) {
      for (const attr of tag.get("attributes")) {
        if (attr.isMarkoAttribute()) {
          const { node } = attr;

          if (eventNameReg.test(node.name) && node.value) {
            if (tag.hub.file.markoOpts.output === "html") {
              attr.remove();
            } else {
              node.arguments = [node.value];
              node.value = t.booleanLiteral(true);
            }
          }
        } else {
          // TODO: needs runtime for spread.
        }
      }
    }
  },
} as t.Visitor;
