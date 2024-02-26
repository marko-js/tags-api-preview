import { types as t } from "@marko/compiler";

const AttributeVisitor = {
  MarkoAttribute(attr) {
    if (!attr.node.bound) {
      return;
    }

    const value = attr.get("value");

    if (!value.isIdentifier()) {
      throw value.buildCodeFrameError("Can only bind to variable names.");
    }

    const tempId = t.identifier("_");

    const changeAttr = t.markoAttribute(
      `${attr.node.name}Change`,
      t.arrowFunctionExpression(
        [tempId],
        t.assignmentExpression("=", value.node, tempId),
      ),
    );

    attr.node.bound = false;
    changeAttr.extra = { ___wasBound: true };
    attr.insertAfter(changeAttr);
  },
} as t.Visitor;

export default {
  Program(program) {
    // We must translate all attribute bindings first,
    // otherwise subsequent transforms will not see the
    // assignments.
    program.traverse(AttributeVisitor);
  },
} as t.Visitor;
