export = function (): unknown {
  let curValue: unknown;
  return (newVal?: boolean, write?: 1) => {
    if (write) {
      return (curValue = newVal);
    }

    return curValue;
  };
};
