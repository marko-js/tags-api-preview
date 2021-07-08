import { types as t } from "@marko/compiler";
import checkDeprecations from "./check-deprecations";
import lifecycle from "./lifecycle";
import cachedFunction from "./cached-function/transform";
import nativeTagVar from "./native-tag-var/transform";

export = [
  checkDeprecations,
  lifecycle,
  cachedFunction,
  nativeTagVar,
] as t.Visitor[];
