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
