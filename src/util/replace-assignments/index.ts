export default function assign<V, T extends (value: V) => unknown>(
  fn: T,
  value: V,
): V {
  if (fn) {
    fn(value);
    return value;
  }

  throw new TypeError("Assignment to constant variable.");
}
