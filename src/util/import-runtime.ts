import type { types as t } from "@marko/compiler";
import {
  importDefault as _importDefault,
  importNamed as _importNamed,
} from "@marko/babel-utils";
const prefix =
  process.env.NODE_ENV === "production"
    ? "@marko/tags-api-preview/dist/"
    : process.cwd() + "/src/";

export function importRuntimeDefault(
  file: t.BabelFile,
  request: string,
  nameHint?: string,
) {
  return _importDefault(file, prefix + request, nameHint);
}

export function importRuntimeNamed(
  file: t.BabelFile,
  request: string,
  name: string,
  nameHint?: string,
) {
  return _importNamed(file, prefix + request, name, nameHint);
}
