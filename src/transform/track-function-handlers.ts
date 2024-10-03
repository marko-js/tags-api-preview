import { types as t } from "@marko/compiler";
import isApi from "../util/is-api";
const eventNameReg = /^on[A-Z]/;
const changeNameReg = /Change$/;

export default {
  MarkoTag(tag: t.NodePath<t.MarkoTag>) {
    if (isApi(tag, "tags")) {
      // Tells Marko that this tag uses event handlers.
      const file = tag.hub.file;
      const meta = file.metadata.marko as any;
      if (!meta.hasFunctionEventHandlers) {
        for (const attr of tag.node.attributes) {
          if (
            t.isMarkoAttribute(attr) &&
            (eventNameReg.test(attr.name) || changeNameReg.test(attr.name))
          ) {
            meta.hasFunctionEventHandlers = true;
            break;
          }
        }
      }
    }
  },
} as t.Visitor;
