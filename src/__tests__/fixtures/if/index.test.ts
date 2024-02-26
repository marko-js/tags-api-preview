import fixture from "../../fixture";

describe(
  "<if> basic hidden",
  fixture("./templates/basic.marko", { show: false }),
);
describe(
  "<if> basic shown",
  fixture("./templates/basic.marko", { show: true }),
);
describe(
  "<if> basic toggled",
  fixture("./templates/basic.marko", [
    { show: true },
    { show: false },
    { show: true },
  ]),
);

describe(
  "<if> error args",
  fixture("./templates/error-args.marko", { show: true }),
);

describe(
  "<if> error body parameters",
  fixture("./templates/error-body-parameters.marko", { show: true }),
);

describe(
  "<if> error extra attr",
  fixture("./templates/error-extra-attr.marko", { show: true }),
);

describe(
  "<if> error no attr",
  fixture("./templates/error-no-attr.marko", { show: true }),
);

describe(
  "<if> error no content",
  fixture("./templates/error-no-content.marko", { show: true }),
);

describe(
  "<if> error tag var",
  fixture("./templates/error-tag-var.marko", { show: true }),
);
