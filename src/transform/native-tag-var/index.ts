export = () => fail;

function fail() {
  throw new Error("Cannot read an element reference while rendering.");
}
