type ChangeHandler = (val: unknown) => void;
const eventNameReg = /^on[A-Z]/;
const changeNameReg = /Change$/;
const bindsByTag: Record<
  string,
  | undefined
  | Record<
      string,
      undefined | ((change: ChangeHandler) => (e: InputEvent) => void)
    >
> = {};

registerBind("input", "value");
registerBind("input", "checked");
registerBind("textarea", "value");
registerBind("select", "value", (e) => {
  const target = e.target as HTMLSelectElement;
  return target.multiple
    ? Array.from(target.selectedOptions, (option) => option.value)
    : target.value;
});

export = (
  attrs: Record<string, unknown>,
  def: any,
  tag: string,
  meta: Record<string, unknown> & { pa?: string[] }
) => {
  const binds = bindsByTag[tag];
  const resultAttrs: Record<string, unknown> = {};

  for (const key in attrs) {
    const val = attrs[key];

    if (eventNameReg.test(key)) {
      if (val) {
        const eventName = key.toLowerCase();
        meta[eventName] = def.d(eventName.slice(2), val, false);
      }
    } else if (!(binds?.[key] || changeNameReg.test(key))) {
      resultAttrs[key] = val;
    }
  }

  if (binds) {
    for (const key in binds) {
      const handler = attrs[`${key}Change`] as ChangeHandler;
      resultAttrs[key] = attrs[key];

      if (handler) {
        meta.oninput = def.d("input", binds[key]!(handler), false);
      } else {
        (meta.pa || (meta.pa = [])).push(key);
      }
    }
  }

  return resultAttrs;
};

function registerBind(
  tag: string,
  prop: string,
  reader?: (e: InputEvent) => unknown
) {
  bindsByTag[tag] = bindsByTag[tag] || {};
  bindsByTag[tag][prop] = reader
    ? (change) => (e) => change(reader(e))
    : (change) => (e) => change((e.target as any)[prop]);
}
