import { expect } from "chai";
import fixture from "../../fixture";

describe("<style> basic", () => {
  fixture("./templates/basic.marko")();

  it("should expose style meta data", async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    expect(require("./templates/basic.marko"))
      .has.property("default")
      .has.property("meta")
      .with.property("deps")
      .to.deep.equal([
        {
          type: "css",
          startPos: 7,
          endPos: 39,
          style: true,
          path: "./basic.marko",
          virtualPath: "./basic.marko.css",
          code: "\n  .test {\n    color: green\n  }\n",
        },
      ]);
  });
});

describe("<style> module", fixture("./templates/module.marko"));

describe("<style> custom lang", () => {
  fixture("./templates/custom-lang.marko")();

  it("should expose style meta data", async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    expect(require("./templates/custom-lang.marko"))
      .has.property("default")
      .has.property("meta")
      .with.property("deps")
      .to.deep.equal([
        {
          type: "less",
          startPos: 12,
          endPos: 44,
          style: true,
          path: "./custom-lang.marko",
          virtualPath: "./custom-lang.marko.less",
          code: "\n  .test {\n    color: green\n  }\n",
        },
        {
          type: "modules.less",
          startPos: 74,
          endPos: 106,
          style: true,
          path: "./custom-lang.marko",
          virtualPath: "./custom-lang.marko.1.modules.less",
          code: "\n  .test {\n    color: green\n  }\n",
        },
      ]);
  });
});

describe("<style> class api", fixture("./templates/class-api.marko"));

describe("<style> error args", fixture("./templates/error-args.marko"));

describe("<style> error attrs", fixture("./templates/error-attrs.marko"));

describe(
  "<style> error body parameters",
  fixture("./templates/error-body-parameters.marko")
);

describe(
  "<style> error class attr",
  fixture("./templates/error-class-attr.marko")
);

describe(
  "<style> error interpolation",
  fixture("./templates/error-interpolation.marko")
);

describe(
  "<style> error no content",
  fixture("./templates/error-no-content.marko")
);
