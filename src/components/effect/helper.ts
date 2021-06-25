type Deps = unknown[];
type EffectFn = () => (() => void) | void;
type EffectMeta = (EffectFn | Deps | 1 | 0 | void)[];

interface Component {
  [x: string]: unknown;
  ___effectIndex?: number;
  ___effectMeta?: EffectMeta;
  __proto__: {
    [x: string]: unknown;
  };
}

export = function (component: Component, fn: EffectFn, deps: Deps) {
  // Effect meta data stored in an array of [fn, deps, changed]
  const meta = component.___effectMeta;
  const index = component.___effectIndex;

  if (meta) {
    if (index === undefined) {
      meta.push(fn, deps, 1);
    } else {
      component.___effectIndex! += 3;
      if (deps) {
        const previousDeps = meta[index + 1] as Deps;
        for (let i = 0; i < deps.length; i++) {
          if (deps[i] !== previousDeps[i]) {
            if (meta[index]) (meta[index] as EffectFn)(); // run cleanup
            meta[index] = fn; // save new effect function
            meta[index + 1] = deps; // save new deps
            meta[index + 2] = 1; // mark effect as changed
            break;
          }
        }
      }
    }
  } else {
    patchLifecycle(component.__proto__);
    component.___effectMeta = [fn, deps, 1];
  }
};

function patchLifecycle(proto: Component["__proto__"]) {
  if (proto.onMount !== runEffects) {
    proto.onMount = proto.onUpdate = runEffects;
    proto.onDestroy = runCleanups;
  }
}

function runEffects(this: Component) {
  const meta = this.___effectMeta!;

  if (meta) {
    this.___effectIndex = 0;
    for (let i = 0; i < meta.length; i += 3) {
      if (meta[i + 2]) {
        // check if effect has changed
        meta[i + 2] = 0; // mark effect as not changed
        meta[i] = (meta[i] as EffectFn)(); // execute effect and save cleanup
      }
    }
  }
}

function runCleanups(this: Component) {
  const meta = this.___effectMeta!;

  if (meta) {
    for (let i = 0; i < meta.length; i += 3) {
      meta[i] && (meta[i] as EffectFn)(); // run cleanup
    }
  }
}
