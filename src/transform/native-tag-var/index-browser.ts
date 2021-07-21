import patchLifecycle from "../../util/patch-lifecycle";

let rendering = false;
const lifecycleMethods = { onRender: startRender };

type anyFn = (...args: unknown[]) => unknown;
declare class Component {
  [x: string]: unknown;
  onRender?: anyFn;
  onMount?: anyFn;
  onUpdate?: anyFn;
  onDestroy?: anyFn;
  getEl(key: string): Element;
}

export = function createElGetter(owner: Component, key: string) {
  if (patchLifecycle(owner, lifecycleMethods)) startRender();

  return (
    owner[key] ||
    (owner[key] = () => {
      if (rendering) {
        throw new Error("Cannot read an element reference while rendering.");
      }
      return owner.getEl(key);
    })
  );
};

function startRender() {
  if (!rendering) {
    rendering = true;
    queueMicrotask(endRender);
  }
}

function endRender() {
  rendering = false;
}
