import fixture, { FixtureHelpers } from "../../fixture";

describe("<return> basic", fixture("./templates/basic.marko"));

describe(
  "<return> write from parent",
  fixture("./templates/write-from-parent.marko", [click("increment")])
);

describe("<return> error args", fixture("./templates/error-args.marko"));

describe(
  "<return> error body content",
  fixture("./templates/error-body-content.marko")
);

describe(
  "<return> error body parameters",
  fixture("./templates/error-body-parameters.marko")
);

describe(
  "<return> error multiple",
  fixture("./templates/error-multiple.marko")
);

describe("<return> error nested", fixture("./templates/error-nested.marko"));

describe(
  "<return> error no default attr",
  fixture("./templates/error-no-default-attr.marko")
);

describe("<return> error tag var", fixture("./templates/error-tag-var.marko"));

function click(text: string) {
  return async ({ fireEvent, screen }: FixtureHelpers) =>
    await fireEvent.click(screen.getByText(text));
}
