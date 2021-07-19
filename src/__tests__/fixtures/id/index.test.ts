import fixture from "../../fixture";

describe("<id> basic", fixture("./templates/basic.marko"));

describe(
  "<id> within-condition",
  fixture("./templates/within-condition.marko", [
    { show: true },
    { show: false },
    { show: true },
  ])
);

describe(
  "<id> within-loop",
  fixture("./templates/within-loop.marko", [
    { fields: ["a"] },
    { fields: ["a", "b", "c"] },
    { fields: ["a", "b"] },
  ])
);

describe("<id> error args", fixture("./templates/error-args.marko"));
describe("<id> error attr", fixture("./templates/error-attr.marko"));
describe(
  "<id> error body content",
  fixture("./templates/error-body-content.marko")
);
describe(
  "<id> error body parameters",
  fixture("./templates/error-body-parameters.marko")
);
describe(
  "<id> error destructured",
  fixture("./templates/error-destructured.marko")
);
describe(
  "<id> error no tag var",
  fixture("./templates/error-no-tag-var.marko")
);
