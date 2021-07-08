import patchLifecycle from "../../util/patch-lifecycle";

let rendering = false;
const lifecycleMethods = {
  onRender: startRender,
  onMount: endRender,
  onUpdate: endRender,
};

type anyFn = (...args: unknown[]) => unknown;
declare class Component {
  [x: string]: unknown;
  onRender?: anyFn;
  onMount?: anyFn;
  onUpdate?: anyFn;
  onDestroy?: anyFn;
  getEl(key: string): Element;
}

const getters = new WeakMap<Component, () => Element>();
export = function createElGetter(owner: Component, key: string) {
  if (patchLifecycle(owner, lifecycleMethods)) startRender();

  let getter = getters.get(owner);

  if (!getter) {
    getters.set(
      owner,
      (getter = () => {
        if (rendering) {
          throw new Error("Cannot read an element reference while rendering.");
        }
        return owner.getEl(key);
      })
    );
  }

  return getter;
};

function startRender() {
  rendering = true;
}

function endRender() {
  rendering = false;
}
