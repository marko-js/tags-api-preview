import fixture from "../../fixture";

describe(
  "<if> basic hidden",
  fixture("./templates/basic.marko", { show: false })
);
describe(
  "<if> basic shown",
  fixture("./templates/basic.marko", { show: true })
);
describe(
  "<if> basic toggled",
  fixture("./templates/basic.marko", [
    { show: true },
    { show: false },
    { show: true },
  ])
);
