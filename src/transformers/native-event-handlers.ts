import { types as t } from "@marko/compiler";
import { isNativeTag } from "@marko/babel-utils";
const eventNameReg = /^on[A-Z]/;

// TODO: warn when lowercased variants used and passed a non string

export = (tag: t.NodePath<t.MarkoTag>) => {
  if (isNativeTag(tag)) {
    for (const attr of tag.get("attributes")) {
      if (attr.isMarkoAttribute()) {
        const { node } = attr;
  
        if (eventNameReg.test(node.name) && node.value) {
          node.arguments = [node.value];
          node.value = t.booleanLiteral(true);
        }
      } else {
        // TODO: needs runtime for spread.
      }
    }
  }
};
