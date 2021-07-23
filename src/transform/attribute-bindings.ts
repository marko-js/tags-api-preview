import { types as t } from "@marko/compiler";

export default {
  MarkoAttribute(attr) {
    if (!attr.node.bound) {
      return;
    }

    const value = attr.get("value");

    if (!value.isIdentifier()) {
      throw value.buildCodeFrameError("Can only bind to variable names.");
    }

    const tempId = t.identifier("_");
    attr.node.bound = false;
    attr.insertAfter(
      t.markoAttribute(
        `${attr.node.name}Change`,
        t.arrowFunctionExpression(
          [tempId],
          t.assignmentExpression("=", value.node, tempId)
        )
      )
    );
  },
} as t.Visitor;
