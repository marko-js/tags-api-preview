import fixture, { FixtureHelpers } from "../../fixture";

describe(
  "<let> basic",
  fixture("./templates/basic.marko", [
    { value: 1 },
    click("Increment"),
    click("Increment"),
  ])
);

describe(
  "<let> hoisted",
  fixture("./templates/hoisted.marko", [
    { value: 1 },
    click("Increment"),
    click("Increment"),
  ])
);

describe(
  "<let> within-condition",
  fixture("./templates/within-condition.marko", [
    { show: true, value: 0 },
    click("Increment"),
    click("Increment"),
    { show: false },
    { show: true, value: 1 },
    click("Increment"),
  ])
);

describe(
  "<let> within-loop",
  fixture("./templates/within-loop.marko", [
    {
      a: 1,
      b: 2,
      c: 3,
    },
    click("Increment a"),
    click("Increment b"),
    click("Increment c"),
    {
      a: 1,
      b: 2,
    },
    click("Increment a"),
  ])
);

function click(text: string) {
  return async ({ fireEvent, screen }: FixtureHelpers) =>
    await fireEvent.click(screen.getByText(text));
}
