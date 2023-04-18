import patchLifecycle from "../../util/patch-lifecycle";

const metaKey = Symbol();
const indexKey = Symbol();
let curComponent: Component | undefined;
let isCached = false;

declare class Component {
  [x: string]: unknown;
  [metaKey]?: unknown[];
  [indexKey]?: number;
}

const lifecycleMethods = {
  onMount: resetIndex,
  onUpdate: resetIndex,
};

export function cached(component: Component, cur: unknown[]) {
  const meta = component[metaKey];
  const index = component[indexKey];
  curComponent = component;

  if (meta) {
    if (index === undefined) {
      meta.push(cur);
      return false;
    }

    const prev = meta[index] as unknown[];
    component[indexKey]! += 2;

    for (let i = prev.length; i--; ) {
      if (prev[i] !== cur[i]) {
        meta[index] = cur;
        return false;
      }
    }

    return (isCached = true);
  }

  patchLifecycle(component, lifecycleMethods);
  component[metaKey] = [cur];
  return false;
}

export function cache(val: unknown) {
  const meta = curComponent![metaKey]!;
  const index = curComponent![indexKey];
  curComponent = undefined;

  if (isCached) {
    isCached = false;
    return index === undefined ? meta[meta.length - 1] : meta[index - 1];
  }

  if (index == undefined) {
    meta.push(val);
  } else {
    meta[index - 1] = val;
  }

  return val;
}

function resetIndex(this: Component) {
  this[indexKey] = 0;
}
