import { types as t } from "@marko/compiler";
import nativeTagHandlers from "./native-tag-handlers/translate";
import trackRendering from "./track-rendering/translate";
import forKeyScope from "./for-key-scope";
export = [nativeTagHandlers, trackRendering, forKeyScope] as t.Visitor[];
