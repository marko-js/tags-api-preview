import { types as t } from "@marko/compiler";
import { importDefault } from "@marko/babel-utils";
import deepFreeze from "../deep-freeze/transform";

export default function replaceAssignments(
  binding: t.Binding,
  fnExpression: t.Expression
): void {
  const file = binding.path.hub.file;
  for (const assignment of binding.constantViolations) {
    let value: t.Expression | undefined;
    if (assignment.isUpdateExpression()) {
      value = t.binaryExpression(
        assignment.node.operator === "++" ? "+" : "-",
        binding.identifier,
        t.numericLiteral(1)
      );
    } else if (assignment.isAssignmentExpression()) {
      value =
        assignment.node.operator === "="
          ? deepFreeze(file, assignment.node.right)
          : t.binaryExpression(
              assignment.node.operator.slice(
                0,
                -1
              ) as t.BinaryExpression["operator"],
              binding.identifier,
              assignment.node.right
            );
    }

    if (value) {
      assignment.replaceWith(
        t.callExpression(importDefault(file, __dirname, "assign"), [
          fnExpression,
          value,
        ])
      );
    }
  }
}
