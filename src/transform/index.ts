import { types as t } from "@marko/compiler";
import checkDeprecations from "./check-deprecations";
import lifecycle from "./lifecycle";
import cachedFunction from "./cached-function/transform";
import nativeTagVar from "./native-tag-var/transform";
import hoistTagVars from "./hoist-tag-vars/transform";

export = [
  checkDeprecations,
  lifecycle,
  cachedFunction,
  hoistTagVars,
  nativeTagVar,
] as t.Visitor[];
