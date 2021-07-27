export = function deepFreeze(val: unknown) {
  if (!Object.isFrozen(val) && typeof val !== "function") {
    Object.freeze(val);
    for (const key in val as Record<string, unknown>) {
      deepFreeze((val as Record<string, unknown>)[key]);
    }
  }

  return val;
};
