import { types as t } from "@marko/compiler";
import deepFreeze from "./deep-freeze/transform";

export default function replaceAssignments(
  binding: t.Binding,
  getReplacement: (value: t.Expression) => t.Expression
): void {
  for (const assignment of binding.constantViolations) {
    if (assignment.isUpdateExpression()) {
      assignment.replaceWith(
        getReplacement(
          t.binaryExpression(
            assignment.node.operator === "++" ? "+" : "-",
            binding.identifier,
            t.numericLiteral(1)
          )
        )
      );
    } else if (assignment.isAssignmentExpression()) {
      assignment.replaceWith(
        getReplacement(
          assignment.node.operator === "="
            ? deepFreeze(binding.path.hub.file, assignment.node.right)
            : t.binaryExpression(
                assignment.node.operator.slice(
                  0,
                  -1
                ) as t.BinaryExpression["operator"],
                binding.identifier,
                assignment.node.right
              )
        )
      );
    }
  }
}
