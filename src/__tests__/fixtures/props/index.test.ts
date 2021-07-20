import fixture from "../../fixture";

describe(
  "<props> basic",
  fixture("./templates/basic.marko", { value: "World" })
);

describe(
  "<props> error args",
  fixture("./templates/error-args.marko", { value: "World" })
);

describe(
  "<props> error attr",
  fixture("./templates/error-attr.marko", { value: "World" })
);

describe(
  "<props> error body content",
  fixture("./templates/error-body-content.marko", { value: "World" })
);

describe(
  "<props> error body parameters",
  fixture("./templates/error-body-parameters.marko", { value: "World" })
);

describe(
  "<props> error multiple",
  fixture("./templates/error-multiple.marko", { value: "World" })
);

describe(
  "<props> error nested",
  fixture("./templates/error-nested.marko", { value: "World" })
);

describe(
  "<props> error no tag var",
  fixture("./templates/error-no-tag-var.marko", { value: "World" })
);
