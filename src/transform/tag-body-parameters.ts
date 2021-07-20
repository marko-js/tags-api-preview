import { types as t } from "@marko/compiler";
import { getTagDef } from "@marko/babel-utils";
import isApi from "../util/is-api";

export default {
  MarkoTag(tag) {
    const params = tag.get("body").get("params");
    const tagDef = getTagDef(tag);
    if (isApi(tag, "class") || !params.length || tagDef?.translator) {
      return;
    }

    for (const name in tag.get("body").getBindingIdentifiers()) {
      const binding = tag.scope.getBinding(name);
      if (binding) {
        const [assignment] = binding.constantViolations;
        if (assignment) {
          throw assignment.buildCodeFrameError(
            "Cannot assign to tag body parameters in the tags api preview."
          );
        }
      }
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
