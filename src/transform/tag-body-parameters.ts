import { types as t } from "@marko/compiler";
import { getTagDef } from "@marko/babel-utils";
import isApi from "../util/is-api";

export default {
  MarkoTag(tag) {
    const body = tag.get("body");
    const params = body.get("params") as any;
    const tagDef = getTagDef(tag);

    if (isApi(tag, "class") || !params.length || tagDef?.translator) {
      return;
    }

    for (const name in body.getBindingIdentifiers()) {
      const binding = body.scope.getBinding(name);
      if (binding) {
        const [assignment] = binding.constantViolations;
        if (assignment) {
          throw assignment.buildCodeFrameError(
            "Cannot assign to tag body parameters in the tags api preview.",
          );
        }
      }
    }

    body.node.params = [
      t.assignmentPattern(
        t.objectPattern([
          t.objectProperty(
            t.identifier("value"),
            t.assignmentPattern(
              t.arrayPattern(body.node.params as t.PatternLike[]),
              t.arrayExpression([]),
            ),
          ),
        ]),
        t.objectExpression([]),
      ),
    ];
  },
} as t.Visitor;
