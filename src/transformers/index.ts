import { types as t } from "@marko/compiler";
import cachedFunction from "./cached-function/transform";
import lifecycle from "./lifecycle";
import nativeTagVar from "./native-tag-var";
import nativeEventHandlers from "./native-event-handlers";
import checkDeprecations from "./check-deprecations";
const visited = new WeakSet();

export = [
  lifecycle,
  cachedFunction,
  checkDeprecations,
  {
    MarkoTag(tag) {
      if (!visited.has(tag.node)) {
        visited.add(tag.node);
        nativeEventHandlers(tag);
        nativeTagVar(tag);
      }
    },
  },
] as t.Visitor[];
