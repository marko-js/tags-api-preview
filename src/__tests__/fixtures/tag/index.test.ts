import fixture from "../../fixture";

describe("<tag> basic", fixture("./templates/basic.marko"));

describe(
  "<tag> with state",
  fixture("./templates/with-state.marko", [
    {
      items: [
        { label: "Nested 1" },
        { label: "Nested 2", items: [{ label: "Nested 3" }] },
      ],
    },
    async ({ screen, fireEvent }) => {
      await fireEvent.click(screen.getAllByRole("checkbox")[0]);
    },
    async ({ screen, fireEvent }) => {
      await fireEvent.click(screen.getAllByRole("checkbox")[1]);
    },
    async ({ screen, fireEvent }) => {
      await fireEvent.click(screen.getAllByRole("checkbox")[2]);
    },
  ]),
);

describe("<tag> error args", fixture("./templates/error-args.marko"));

describe("<tag> error attrs", fixture("./templates/error-attrs.marko"));

describe(
  "<tag> error destructured",
  fixture("./templates/error-destructured.marko"),
);

describe(
  "<tag> error no content",
  fixture("./templates/error-no-content.marko"),
);

describe(
  "<tag> error no tag var",
  fixture("./templates/error-no-tag-var.marko"),
);
