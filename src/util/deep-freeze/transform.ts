import { types as t } from "@marko/compiler";
import { importRuntimeDefault } from "../../util/import-runtime";

export default (file: t.BabelFile, value: t.Expression) => {
  if (
    file.markoOpts.optimize ||
    t.isLiteral(value) ||
    t.isBinaryExpression(value) ||
    t.isUnaryExpression(value)
  ) {
    return value;
  }

  return t.callExpression(
    importRuntimeDefault(file, "util/deep-freeze", "freeze"),
    [value]
  );
};
