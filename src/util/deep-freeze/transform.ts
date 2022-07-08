import { types as t } from "@marko/compiler";
import { importDefault } from "@marko/babel-utils";

export default (file: t.BabelFile, value: t.Expression) => {
  if (
    file.markoOpts.optimize ||
    t.isLiteral(value) ||
    t.isBinaryExpression(value) ||
    t.isUnaryExpression(value)
  ) {
    return value;
  }

  return t.callExpression(importDefault(file, __dirname, "freeze"), [value]);
};
