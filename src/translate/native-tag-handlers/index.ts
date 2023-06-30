const ignoreReg = /^on[A-Z]|Change$/;
export default (from: Record<string, unknown>) => {
  const attrs: Record<string, unknown> = {};

  for (const key in from) {
    if (!ignoreReg.test(key)) {
      attrs[key] = from[key];
    }
  }

  return attrs;
};
