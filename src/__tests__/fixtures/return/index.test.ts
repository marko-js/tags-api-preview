import fixture, { FixtureHelpers } from "../../fixture";

describe("<return> basic", fixture("./templates/basic.marko"));

describe(
  "<return> write from parent",
  fixture("./templates/write-from-parent.marko", [click("increment")])
);

function click(text: string) {
  return async ({ fireEvent, screen }: FixtureHelpers) =>
    await fireEvent.click(screen.getByText(text));
}
