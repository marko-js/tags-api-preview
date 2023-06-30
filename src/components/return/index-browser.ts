import patchLifecycle from "../../util/patch-lifecycle";

const metaKey = Symbol();
const indexKey = Symbol();
declare class Component {
  [x: string]: unknown;
  [metaKey]?: ReturnType<typeof createReturn>[];
  [indexKey]?: number;
  forceUpdate(): void;
}

const lifecycleMethods = {
  onMount: resetIndex,
  onUpdate: resetIndex,
};

export default function getReturn(component: Component) {
  const meta = component[metaKey];
  const index = component[indexKey];
  let val: ReturnType<typeof createReturn>;

  if (meta) {
    if (index === undefined) {
      meta.push((val = createReturn(component)));
    } else {
      val = meta[component[indexKey]!++];
    }
  } else {
    patchLifecycle(component, lifecycleMethods);
    component[metaKey] = [(val = createReturn(component))];
  }

  return val;
}

function resetIndex(this: Component) {
  this[indexKey] = 0;
}

function createReturn(component: Component) {
  let curValue: Record<string, unknown>;
  return function (newVal?: Record<string, unknown>, write?: 1) {
    if (write) {
      if (
        curValue &&
        (curValue.value !== newVal!.value ||
          curValue.valueChange !== newVal!.valueChange)
      ) {
        component.forceUpdate();
      }
      return (curValue = newVal!);
    }

    return curValue;
  };
}
