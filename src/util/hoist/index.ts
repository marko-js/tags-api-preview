export = function hoist(owner: any, name: string) {
  let initialized = false;
  let val: unknown;
  return (child: any, newVal?: unknown) => {
    if (child) {
      initialized = true;
      val = newVal;
    } else if (!initialized) {
      throw new ReferenceError(`Cannot access '${name}' before initialization`);
    }

    return val;
  };
};
