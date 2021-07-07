import { types as t } from "@marko/compiler";
import { getTagDef } from "@marko/babel-utils";
const deprecatedAttrs = new Set([
  "key",
  "no-update",
  "no-update-if",
  "no-update-body",
  "no-update-body-if",
]);

export default {
  MarkoTag(tag) {
    //   const tagDef = getTagDef(tag);
    //   if (tagDef && tagDef.translator) {
    //     return;
    //   }
    //   // if (tag.node.arguments && tag.node.arguments.length) {
    //   //   throw tag
    //   //     .get("name")
    //   //     .buildCodeFrameError(
    //   //       "Tag arguments are no longer supported with the 'Tags API'."
    //   //     );
    //   // }
    //   const attrs = tag.get("attributes");
    //   for (const attr of attrs) {
    //     if (attr.isMarkoAttribute()) {
    //       if (attr.node.modifier) {
    //         throw attr.buildCodeFrameError(
    //           "Attribute modifiers are no longer supported with the 'Tags API'."
    //         );
    //       }
    //       if (attr.node.arguments && attr.node.arguments.length) {
    //         throw attr.buildCodeFrameError(
    //           "Attribute arguments are no longer supported with the 'Tags API'."
    //         );
    //       }
    //       if (deprecatedAttrs.has(attr.node.name)) {
    //         throw attr.buildCodeFrameError(
    //           "This attribute is no longer supported with the 'Tags API'."
    //         );
    //       }
    //     }
    //   }
  },
} as t.Visitor;
