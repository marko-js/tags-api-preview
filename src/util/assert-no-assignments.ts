import { types as t } from "@marko/compiler";
export default (bindingPath: t.NodePath<t.PatternLike>) => {
  for (const name in bindingPath.getBindingIdentifiers()) {
    const binding = bindingPath.scope.getBinding(name)!;
    const [assignment] = binding.constantViolations;

    if (assignment) {
      throw assignment.buildCodeFrameError(
        "Reference is a constant and cannot be assigned."
      );
    }
  }
};
