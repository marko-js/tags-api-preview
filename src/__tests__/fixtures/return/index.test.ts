import fixture, { type FixtureHelpers } from "../../fixture";

describe("<return> basic", fixture("./templates/basic.marko"));

describe("<return> after get", fixture("./templates/after-get/index.marko"));

describe("<return> spread", fixture("./templates/spread.marko"));

describe("<return> read multiple", fixture("./templates/read-multiple.marko"));

describe(
  "<return> write from parent",
  fixture("./templates/write-from-parent.marko", [click("increment")]),
);

describe(
  "<return> write from parent clamped",
  fixture("./templates/write-from-parent-clamped.marko", [
    { max: 2 },
    click("increment"),
    click("increment"),
    { max: 3 },
    click("increment"),
    click("increment"),
  ]),
);

describe("<return> error args", fixture("./templates/error-args.marko"));

describe(
  "<return> error body content",
  fixture("./templates/error-body-content.marko"),
);

describe(
  "<return> error body parameters",
  fixture("./templates/error-body-parameters.marko"),
);

describe(
  "<return> error multiple",
  fixture("./templates/error-multiple.marko"),
);

describe("<return> error nested", fixture("./templates/error-nested.marko"));

describe(
  "<return> error no default attr",
  fixture("./templates/error-no-default-attr.marko"),
);

describe("<return> error tag var", fixture("./templates/error-tag-var.marko"));

function click(text: string) {
  return async ({ fireEvent, screen }: FixtureHelpers) =>
    await fireEvent.click(screen.getByText(text));
}
