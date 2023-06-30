export default function hoist(
  _owner: any,
  name: string,
  hoister: (val: unknown) => void
) {
  let initialized = false;
  return (child: any, val?: unknown) => {
    if (child) {
      initialized = true;
      hoister(val);
    } else if (!initialized) {
      throw new ReferenceError(`Cannot access '${name}' before initialization`);
    }
  };
}
