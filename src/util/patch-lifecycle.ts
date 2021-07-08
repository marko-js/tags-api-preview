const extensionsKey = Symbol();
type anyFn = (...args: unknown[]) => unknown;
type Methods = Record<string, anyFn>;

export = function (component: any, methods: Methods) {
  const proto = component.__proto__;
  const extensions = proto[extensionsKey];

  if (extensions) {
    if (!extensions.has(methods)) {
      extensions.add(methods);
      addMethods(proto, methods);
      return true;
    }
  } else {
    proto[extensionsKey] = new Set([methods]);
    addMethods(proto, methods);
    return true;
  }

  return false;
};

function addMethods(proto: any, methods: Methods) {
  for (const name in methods) {
    proto[name] = callBoth(proto[name], methods[name]);
  }
}

function callBoth(a: anyFn | undefined, b: anyFn) {
  if (a) {
    return function (this: unknown) {
      a.call(this);
      b.call(this);
    };
  }

  return b;
}
