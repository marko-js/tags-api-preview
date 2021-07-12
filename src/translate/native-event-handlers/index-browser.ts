const eventNameReg = /^on[A-Z]/;
export = (def: any, from: any, to: any) => {
  const attrs: any = {};

  for (const key in from) {
    const val = from[key];
    if (eventNameReg.test(key)) {
      const eventName = key.slice(2).toLowerCase();
      to[eventName] = def.d(eventName, val, false);
    } else {
      attrs[key] = val;
    }
  }

  return attrs;
};
