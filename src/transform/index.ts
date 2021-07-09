import { types as t } from "@marko/compiler";
import lifecycle from "./lifecycle";
import cachedFunction from "./cached-function/transform";
import nativeTagVar from "./native-tag-var/transform";
import hoistTagVars from "./hoist-tag-vars/transform";
import featureDetection from "./feature-detection";

export = [
  featureDetection,
  lifecycle,
  cachedFunction,
  hoistTagVars,
  nativeTagVar,
] as t.Visitor[];
