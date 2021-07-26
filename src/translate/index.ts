import { types as t } from "@marko/compiler";
import nativeTagHandlers from "./native-tag-handlers/translate";
import trackRendering from "./track-rendering/translate";
export = [nativeTagHandlers, trackRendering] as t.Visitor[];
