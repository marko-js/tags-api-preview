import fixture from "../../fixture";

describe(
  "<get> & <set> self reference",
  fixture("./templates/self-reference.marko")
);

describe(
  "<get> & <set> reference by tag name",
  fixture("./templates/reference-by-tag-name/index.marko")
);

describe(
  "<get> & <set> provide through single child",
  fixture("./templates/provide-direct-child/index.marko")
);

describe(
  "<get> & <set> provide through multiple children",
  fixture("./templates/provide-across-children/index.marko")
);
