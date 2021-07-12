import { types as t } from "@marko/compiler";
import nativeEventHandlers from "./native-event-handlers/translate";
export = [nativeEventHandlers] as t.Visitor[];
