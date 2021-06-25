import fixture from "../../fixture";

describe("<const> basic", fixture("./templates/basic.marko"));

describe("<const> destructuring", fixture("./templates/destructuring.marko"));

describe(
  "<const> input derived",
  fixture("./templates/input-derived.marko", [{ value: 1 }, { value: 2 }])
);

describe(
  "<const> state derived",
  fixture("./templates/state-derived.marko", [
    { value: 1 },
    async ({ screen, fireEvent }) =>
      await fireEvent.click(screen.getByText("increment")),
  ])
);

describe("<const> mutation error", fixture("./templates/error-mutation.marko"));
