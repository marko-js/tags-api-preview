// eslint-disable-next-line prefer-const
let rendering = 0;

export function begin() {
  rendering++;
}

export function end() {
  rendering--;
}

export function isRendering() {
  return rendering > 0;
}
