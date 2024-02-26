import { types as t } from "@marko/compiler";
import { importRuntimeDefault } from "../../util/import-runtime";
import deepFreeze from "../deep-freeze/transform";

export default function replaceAssignments(
  binding: t.Binding,
  fnExpression: t.Expression,
): void {
  const file = binding.path.hub.file;
  for (const assignment of binding.constantViolations) {
    let value: t.Expression | undefined;
    if (assignment.isUpdateExpression()) {
      value = t.binaryExpression(
        assignment.node.operator === "++" ? "+" : "-",
        binding.identifier,
        t.numericLiteral(1),
      );
    } else if (assignment.isAssignmentExpression()) {
      value =
        assignment.node.operator === "="
          ? deepFreeze(file, assignment.node.right)
          : t.binaryExpression(
              assignment.node.operator.slice(
                0,
                -1,
              ) as t.BinaryExpression["operator"],
              binding.identifier,
              assignment.node.right,
            );
    }

    if (value) {
      const parent = assignment.parentPath!;
      if (
        // If the assignment was from a bound attribute
        // we just replace the attr value with the change function.
        parent.isFunction() &&
        parent.parentPath!.isMarkoAttribute() &&
        parent.parentPath!.node.extra?.___wasBound
      ) {
        parent.replaceWith(fnExpression);
      } else {
        assignment.replaceWith(
          t.callExpression(
            importRuntimeDefault(file, "util/replace-assignments", "assign"),
            [fnExpression, value],
          ),
        );
      }
    }
  }
}
