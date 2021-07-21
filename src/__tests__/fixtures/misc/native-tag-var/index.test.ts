import { spy, resetHistory } from "sinon";
import fixture from "../../../fixture";

const onValue = spy();

describe("misc native tag vars", () => {
  describe(
    "basic",
    fixture("./templates/basic.marko", [
      { onValue },
      ({ expect }) => {
        expect(onValue)
          .to.be.calledOnce.with.property("args")
          .with.property("0")
          .with.property("0")
          .that.has.text("Hello");
        resetHistory();
      },
    ])
  );

  describe(
    "error read before mount",
    fixture("./templates/error-read-before-mount.marko")
  );

  describe(
    "error destructured",
    fixture("./templates/error-destructured.marko")
  );
});
