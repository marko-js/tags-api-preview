import fixture from "../../fixture";

describe(
  "<attrs> basic",
  fixture("./templates/basic.marko", { value: "World" })
);

describe(
  "<attrs> error args",
  fixture("./templates/error-args.marko", { value: "World" })
);

describe(
  "<attrs> error attr",
  fixture("./templates/error-attr.marko", { value: "World" })
);

describe(
  "<attrs> error body content",
  fixture("./templates/error-body-content.marko", { value: "World" })
);

describe(
  "<attrs> error body parameters",
  fixture("./templates/error-body-parameters.marko", { value: "World" })
);

describe(
  "<attrs> error multiple",
  fixture("./templates/error-multiple.marko", { value: "World" })
);

describe(
  "<attrs> error nested",
  fixture("./templates/error-nested.marko", { value: "World" })
);

describe(
  "<attrs> error no tag var",
  fixture("./templates/error-no-tag-var.marko", { value: "World" })
);
