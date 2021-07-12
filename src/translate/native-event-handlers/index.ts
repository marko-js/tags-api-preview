const eventNameReg = /^on[A-Z]/;
export = (def: any, from: any) => {
  const attrs: any = {};

  for (const key in from) {
    if (!eventNameReg.test(key)) {
      attrs[key] = from[key];
    }
  }

  return attrs;
};
