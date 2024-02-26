import fixture from "../../fixture";

describe("<const> basic", fixture("./templates/basic.marko"));

describe("<const> destructuring", fixture("./templates/destructuring.marko"));

describe("<const> after get", fixture("./templates/after-get/index.marko"));

describe(
  "<const> input derived",
  fixture("./templates/input-derived.marko", [{ value: 1 }, { value: 2 }]),
);

describe(
  "<const> state derived",
  fixture("./templates/state-derived.marko", [
    { value: 1 },
    async ({ screen, fireEvent }) => {
      await fireEvent.click(screen.getByText("increment"));
    },
  ]),
);

describe(
  "<const> state derived from prototype function",
  fixture("./templates/state-derived-prototype-function.marko", [
    { value: 1 },
    async ({ screen, fireEvent }) => {
      await fireEvent.click(screen.getByText("increment"));
    },
  ]),
);

describe(
  "<const> assignment error",
  fixture("./templates/error-assignment.marko"),
);

describe("<const> mutation error", fixture("./templates/error-mutation.marko"));
describe("<const> args error", fixture("./templates/error-args.marko"));
describe(
  "<const> body content error",
  fixture("./templates/error-body-content.marko"),
);
describe(
  "<const> body parameters error",
  fixture("./templates/error-body-parameters.marko"),
);
describe(
  "<const> extra attribute error",
  fixture("./templates/error-extra-attr.marko"),
);
describe(
  "<const> missing default attribute error",
  fixture("./templates/error-no-default-attr.marko"),
);
describe(
  "<const> missing var error",
  fixture("./templates/error-no-var.marko"),
);
