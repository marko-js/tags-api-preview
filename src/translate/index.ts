import { types as t } from "@marko/compiler";
import nativeTagHandlers from "./native-tag-handlers/translate";
export = [nativeTagHandlers] as t.Visitor[];
