import fixture, { FixtureHelpers } from "../../../fixture";
const increment = click("Increment");
const toggle = click("Toggle");

describe(
  "cached conditional value",
  fixture("./templates/basic.marko", [
    {},
    increment,
    toggle,
    toggle,
    increment,
    toggle,
  ])
);

function click(text: string) {
  return async ({ fireEvent, screen }: FixtureHelpers) =>
    await fireEvent.click(screen.getByText(text));
}
