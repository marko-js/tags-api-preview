import patchLifecycle from "../patch-lifecycle";

let rendering = false;
const definesKey = Symbol();
const defineIndexKey = Symbol();
const definedSettersKey = Symbol();
const lifecycleMethods = {
  onRender: onRender,
  onMount: onUpdate,
  onUpdate: onUpdate,
  onDestroy: onDestroy,
};

type anyFn = (...args: unknown[]) => unknown;
declare class Component {
  [x: string]: unknown;
  [definesKey]?: ReturnType<typeof createDefine>[];
  [defineIndexKey]?: number;
  [definedSettersKey]?: Set<ReturnType<typeof createDefine>>;
  onRender?: anyFn;
  onMount?: anyFn;
  onUpdate?: anyFn;
  onDestroy?: anyFn;
  forceUpdate(): void;
}

export = function define(owner: Component, name: string) {
  const defines = owner[definesKey];
  const index = owner[defineIndexKey];
  let result;

  if (defines) {
    if (index === undefined) {
      defines.push((result = createDefine(owner, name)));
    } else {
      result = defines[index];
    }
  } else {
    rendering = true;
    patchLifecycle(owner, lifecycleMethods);
    owner[definesKey] = [(result = createDefine(owner, name))];
  }

  return result;
};

function createDefine(owner: Component, name: string) {
  let initialized = false;
  let val: unknown;

  return function setOrGet(child?: Component | true, newVal?: unknown) {
    if (child) {
      if (initialized || child === true) {
        if (val !== (val = newVal)) owner.forceUpdate();
      } else {
        val = newVal;
        initialized = true;
        if (child[definedSettersKey]) {
          child[definedSettersKey]!.add(setOrGet);
        } else {
          child[definedSettersKey] = new Set([setOrGet]);
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
  if (this[definesKey]) {
    this[defineIndexKey] = 0;
  }

  rendering = false;
}

function onDestroy(this: Component) {
  if (this[definedSettersKey]) {
    for (const set of this[definedSettersKey]!) {
      set(true);
    }
  }
}
