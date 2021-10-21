import { spy, resetHistory } from "sinon";
import fixture from "../../../fixture";

const onValue = spy();

describe("misc dynamic tag vars", () => {
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
});
