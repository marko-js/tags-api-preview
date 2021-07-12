import { types as t } from "@marko/compiler";
import { getTagDef } from "@marko/babel-utils";

export default {
  MarkoTag(tag) {
    if (tag.hub.file.path.node.extra!.___featureType === "class") return;
    const params = tag.get("body").get("params");
    const tagDef = getTagDef(tag);
    if (!params.length || tagDef?.translator) {
      return;
    }

    tag.node.body.params = [
      t.assignmentPattern(
        t.objectPattern([
          t.objectProperty(
            t.identifier("default"),
            t.assignmentPattern(
              t.arrayPattern(tag.node.body.params as t.PatternLike[]),
              t.arrayExpression([])
            )
          ),
        ]),
        t.objectExpression([])
      ),
    ];
  },
} as t.Visitor;
