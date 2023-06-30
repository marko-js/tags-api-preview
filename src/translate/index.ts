import type { types as t } from "@marko/compiler";
import classApiCustomTagHandlers from "./class-api-custom-tag-handlers";
import nativeTagHandlers from "./native-tag-handlers/translate";
import trackRendering from "./track-rendering/translate";
import forKeyScope from "./for-key-scope";

export default [
  classApiCustomTagHandlers,
  nativeTagHandlers,
  trackRendering,
  forKeyScope,
] as t.Visitor[];
