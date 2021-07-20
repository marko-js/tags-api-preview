import patchLifecycle from "../../util/patch-lifecycle";

type anyFn = (...args: unknown[]) => unknown;
type LifecycleMeta = (LifecycleHandlers | 1 | 0)[];
type LifecycleHandlers = {
  onMount?(this: LifecycleHandlers): void;
  onUpdate?(this: LifecycleHandlers): void;
  onDestroy?(this: LifecycleHandlers): void;
  [x: string]: unknown;
};

const metaKey = Symbol();
const indexKey = Symbol();

declare class Component {
  [x: string]: unknown;
  [metaKey]?: LifecycleMeta;
  [indexKey]?: number;
  onMount?: anyFn;
  onUpdate?: anyFn;
  onDestroy?: anyFn;
}

const lifecycleMethods = {
  onMount: runMount,
  onUpdate: runUpdate,
  onDestroy: runDestroy,
};

export = function (component: Component, cur: LifecycleHandlers = {}) {
  const meta = component[metaKey];
  const index = component[indexKey];

  if (meta) {
    if (index === undefined) {
      meta.push(0, cur);
    } else {
      component[indexKey]! += 2;
      const prev = meta[index + 1] as LifecycleHandlers;
      prev.onMount = cur.onMount;
      prev.onDestroy = cur.onDestroy;

      if (prev.onUpdate !== cur.onUpdate) {
        meta[index] = 1;
        prev.onUpdate = cur.onUpdate;
      }
    }
  } else {
    patchLifecycle(component, lifecycleMethods);
    component[metaKey] = [0, cur];
  }
};

function runMount(this: Component) {
  const meta = this[metaKey]!;

  if (meta) {
    this[indexKey] = 0;
    for (let i = 1; i < meta.length; i += 2) {
      const handlers = meta[i] as LifecycleHandlers;

      if (handlers.onMount) {
        handlers.onMount();
      }
    }
  }
}

function runUpdate(this: Component) {
  const meta = this[metaKey]!;

  if (meta) {
    this[indexKey] = 0;
    for (let i = 0; i < meta.length; i += 2) {
      if (meta[i]) {
        meta[i] = 0; // mark lifecycle as not changed
        const handlers = meta[i + 1] as LifecycleHandlers;

        if (handlers.onUpdate) {
          handlers.onUpdate();
        }
      }
    }
  }
}

function runDestroy(this: Component) {
  const meta = this[metaKey]!;

  if (meta) {
    for (let i = 1; i < meta.length; i += 2) {
      const handlers = meta[i] as LifecycleHandlers;

      if (handlers.onDestroy) {
        handlers.onDestroy();
      }
    }
  }
}
