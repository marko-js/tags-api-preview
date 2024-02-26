import { isRendering } from "../../translate/track-rendering";
import patchLifecycle from "../../util/patch-lifecycle";

const hoistsKey = Symbol();
const hoistIndexKey = Symbol();
const hoistedSettersKey = Symbol();
const lifecycleMethods = {
  onMount: onUpdate,
  onUpdate: onUpdate,
  onDestroy: onDestroy,
};

type Hoister = (val: unknown) => void;
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

export default function hoist(
  owner: Component,
  name: string,
  hoister: Hoister,
) {
  const hoists = owner[hoistsKey];
  const index = owner[hoistIndexKey];
  let result;

  if (hoists) {
    if (index === undefined) {
      hoists.push((result = createHoist(owner, name, hoister)));
    } else {
      result = hoists[index];
    }
  } else {
    patchLifecycle(owner, lifecycleMethods);
    owner[hoistsKey] = [(result = createHoist(owner, name, hoister))];
  }

  return result;
}

function createHoist(owner: Component, name: string, hoister: Hoister) {
  let initialized = false;
  let val: unknown;

  return function setOrCheckDefined(
    child?: Component | true,
    newVal?: unknown,
  ) {
    if (child) {
      if (initialized || child === true) {
        if (val !== (val = newVal)) {
          hoister(val);
          owner.forceUpdate();
        }
      } else {
        val = newVal;
        hoister(val);
        initialized = true;
        if (child[hoistedSettersKey]) {
          child[hoistedSettersKey]!.add(setOrCheckDefined);
        } else {
          patchLifecycle(child, lifecycleMethods);
          child[hoistedSettersKey] = new Set([setOrCheckDefined]);
        }
      }
    } else if (isRendering()) {
      throw new ReferenceError(`Cannot access '${name}' before initialization`);
    }
    return val;
  };
}

function onUpdate(this: Component) {
  this[hoistIndexKey] = 0;
}

function onDestroy(this: Component) {
  if (this[hoistedSettersKey]) {
    for (const set of this[hoistedSettersKey]!) {
      set(true);
    }
  }
}
