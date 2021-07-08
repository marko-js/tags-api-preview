import patchLifecycle from "../../util/patch-lifecycle";

let rendering = false;
const hoistsKey = Symbol();
const hoistIndexKey = Symbol();
const hoistedSettersKey = Symbol();
const lifecycleMethods = {
  onRender: onRender,
  onMount: onUpdate,
  onUpdate: onUpdate,
  onDestroy: onDestroy,
};

type anyFn = (...args: unknown[]) => unknown;
declare class Component {
  [x: string]: unknown;
  [hoistsKey]?: ReturnType<typeof createHoist>[];
  [hoistIndexKey]?: number;
  [hoistedSettersKey]?: Set<ReturnType<typeof createHoist>>;
  onRender?: anyFn;
  onMount?: anyFn;
  onUpdate?: anyFn;
  onDestroy?: anyFn;
  forceUpdate(): void;
}

export = function hoist(owner: Component, name: string) {
  const hoists = owner[hoistsKey];
  const index = owner[hoistIndexKey];
  let result;

  if (hoists) {
    if (index === undefined) {
      hoists.push((result = createHoist(owner, name)));
    } else {
      result = hoists[index];
    }
  } else {
    rendering = true;
    patchLifecycle(owner, lifecycleMethods);
    owner[hoistsKey] = [(result = createHoist(owner, name))];
  }

  return result;
};

function createHoist(owner: Component, name: string) {
  let initialized = false;
  let val: unknown;

  return function setOrGet(child?: Component | true, newVal?: unknown) {
    if (child) {
      if (initialized || child === true) {
        if (val !== (val = newVal)) owner.forceUpdate();
      } else {
        val = newVal;
        initialized = true;
        if (child[hoistedSettersKey]) {
          child[hoistedSettersKey]!.add(setOrGet);
        } else {
          child[hoistedSettersKey] = new Set([setOrGet]);
        }
      }
    } else if (rendering) {
      throw new ReferenceError(`Cannot access '${name}' before initialization`);
    }

    return val;
  };
}

function onRender() {
  rendering = true;
}

function onUpdate(this: Component) {
  if (this[hoistsKey]) {
    this[hoistIndexKey] = 0;
  }

  rendering = false;
}

function onDestroy(this: Component) {
  if (this[hoistedSettersKey]) {
    for (const set of this[hoistedSettersKey]!) {
      set(true);
    }
  }
}
