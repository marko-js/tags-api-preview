import type { types as t } from "@marko/compiler";
import wrapperComponent from "./wrapper-component";
import cachedValues from "./cached-values/transform";
import nativeTagVar from "./native-tag-var/transform";
import hoistTagVars from "./hoist-tag-vars/transform";
import featureDetection from "./feature-detection";
import tagBodyParameters from "./tag-body-parameters";
import customTagVar from "./custom-tag-var";
import assignmentsToChangeCall from "./assignments-to-change-call";
import attributeBindings from "./attribute-bindings";

export = [
  featureDetection,
  wrapperComponent,
  cachedValues,
  assignmentsToChangeCall,
  hoistTagVars,
  attributeBindings,
  nativeTagVar,
  customTagVar,
  tagBodyParameters,
] as t.Visitor[];
