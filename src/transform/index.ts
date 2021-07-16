import { types as t } from "@marko/compiler";
import wrapperComponent from "./wrapper-component";
import cachedFunction from "./cached-function/transform";
import nativeTagVar from "./native-tag-var/transform";
import hoistTagVars from "./hoist-tag-vars/transform";
import featureDetection from "./feature-detection";
import tagBodyParameters from "./tag-body-parameters";
import customTagVar from "./custom-tag-var";

export = [
  featureDetection,
  wrapperComponent,
  cachedFunction,
  hoistTagVars,
  nativeTagVar,
  customTagVar,
  tagBodyParameters,
] as t.Visitor[];
