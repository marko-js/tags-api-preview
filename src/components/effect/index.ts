import patchLifecycle from "../../util/patch-lifecycle";

type anyFn = (...args: unknown[]) => unknown;
type EffectFn = () => () => void;
type EffectCleanupFn = () => (() => void) | void;
type EffectMeta = (EffectFn | EffectCleanupFn | 1 | 0)[];

const metaKey = Symbol();
const indexKey = Symbol();

declare class Component {
  [x: string]: unknown;
  [metaKey]?: EffectMeta;
  [indexKey]?: number;
  onMount?: anyFn;
  onUpdate?: anyFn;
  onDestroy?: anyFn;
}

const lifecycleMethods = {
  onMount: runEffects,
  onUpdate: runEffects,
  onDestroy: runCleanups,
};

export = function (component: Component, fn: EffectFn) {
  // Effect meta data stored in an array of [fn, deps, changed]
  const meta = component[metaKey];
  const index = component[indexKey];

  if (meta) {
    if (index === undefined) {
      meta.push(1, fn, 0);
    } else {
      component[indexKey]! += 3;
      if (meta[index + 1] !== fn) {
        const cleanup = meta[index + 2] as EffectCleanupFn | undefined;
        meta[index] = 1; // mark effect as changed
        meta[index + 1] = fn; // save new effect function
        if (cleanup) {
          cleanup();
          meta[index + 2] = 0; // clear cleanup function
        }
      }
    }
  } else {
    patchLifecycle(component, lifecycleMethods);
    component[metaKey] = [1, fn, 0];
  }
};

function runEffects(this: Component) {
  const meta = this[metaKey]!;

  if (meta) {
    this[indexKey] = 0;
    for (let i = 0; i < meta.length; i += 3) {
      // check if effect has changed
      if (meta[i]) {
        const fn = meta[i + 1] as EffectFn | undefined;
        meta[i] = 0; // mark effect as not changed

        if (fn) {
          meta[i + 2] = fn(); // execute effect and save cleanup
        }
      }
    }
  }
}

function runCleanups(this: Component) {
  const meta = this[metaKey]!;

  if (meta) {
    for (let i = 2; i < meta.length; i += 3) {
      const cleanup = meta[i] as EffectCleanupFn | undefined;
      cleanup && cleanup();
    }
  }
}
