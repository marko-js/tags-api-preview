import { isRendering } from "../../translate/track-rendering";

declare class Component {
  [x: string]: unknown;
  getEl(key: string): Element;
}

export default function createElGetter(owner: Component, key: string) {
  return (
    owner[key] ||
    (owner[key] = () => {
      if (isRendering()) {
        throw new Error("Cannot read an element reference while rendering.");
      }
      return owner.getEl(key);
    })
  );
}
