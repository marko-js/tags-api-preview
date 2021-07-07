import patchLifecycle from "../../util/patch-lifecycle";

const metaKey = Symbol();
const indexKey = Symbol();

declare class Component {
  [x: string]: unknown;
  [metaKey]?: unknown[];
  [indexKey]?: number;
}

const lifecycleMethods = {
  onMount: resetIndex,
  onUpdate: resetIndex,
};

export function cached(component: Component, ...cur: unknown[]) {
  const meta = component[metaKey];
  const index = component[indexKey];

  if (meta) {
    if (index === undefined) {
      meta.push(cur);
      return;
    }

    const prev = meta[index] as unknown[];

    for (let i = prev.length; i--; ) {
      if (prev[i] !== cur[i]) {
        component[indexKey]!++;
        meta[index] = cur;
        return;
      }
    }

    component[indexKey]! += 2;
    return meta[index + 1];
  } else {
    patchLifecycle(component, lifecycleMethods);
    component[metaKey] = [cur];
  }
}

export function cache(component: Component, val: unknown) {
  const meta = component[metaKey]!;
  const index = component[indexKey];

  if (index == undefined) {
    meta.push(val);
  } else {
    component[indexKey]!++;
    meta[index] = val;
  }

  return val;
}

function resetIndex(this: Component) {
  if (this[metaKey]) {
    this[indexKey] = 0;
  }
}
