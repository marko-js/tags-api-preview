import type { types as t } from "@marko/compiler";
import wrapperComponent from "./wrapper-component";
import cachedValues from "./cached-values/transform";
import nativeTagVar from "./native-tag-var/transform";
import nativeTagHandlers from "./track-function-handlers";
import hoistTagVars from "./hoist-tag-vars/transform";
import featureDetection from "./feature-detection";
import tagBodyParameters from "./tag-body-parameters";
import customTagVar from "./custom-tag-var";
import assignmentsToChangeCall from "./assignments-to-change-call";
import attributeBindings from "./attribute-bindings";
import trackFunctionHandlers from "./track-function-handlers";

export default [
  featureDetection,
  wrapperComponent,
  cachedValues,
  assignmentsToChangeCall,
  hoistTagVars,
  attributeBindings,
  nativeTagVar,
  nativeTagHandlers,
  customTagVar,
  tagBodyParameters,
  trackFunctionHandlers,
] as t.Visitor[];
