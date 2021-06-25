import { types as t } from "@marko/compiler";
import { isNativeTag } from "@marko/babel-utils";
import { visitor as lifecycleVisitor } from "./lifecycle";
import nativeTagVar from "./native-tag-var";
import nativeEventHandlers from "./native-event-handlers";
import checkDeprecations from "./check-deprecations";
const visited = new WeakSet();

export = {
  Program: lifecycleVisitor.Program,
  MarkoTag(tag) {
    if (!visited.has(tag.node)) {
      visited.add(tag.node);
      checkDeprecations(tag);
      lifecycleVisitor.MarkoTag(tag);

      if (isNativeTag(tag)) {
        nativeEventHandlers(tag);
        nativeTagVar(tag);
      } else {
        // TODO: transform custom tag var.
      }
    }
  },
} as t.Visitor;
