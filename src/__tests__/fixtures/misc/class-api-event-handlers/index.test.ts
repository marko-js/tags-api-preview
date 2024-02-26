import { spy, resetHistory } from "sinon";
import fixture from "../../../fixture";

const onValue = spy();

describe("misc native tag event handlers", () => {
  describe(
    "basic",
    fixture("./templates/basic.marko", [
      { onValue },
      async ({ expect, fireEvent, screen }) => {
        expect(onValue).has.not.been.called;

        await fireEvent.click(screen.getByText("emit 1"));

        expect(onValue).has.been.calledOnceWith(1);
        resetHistory();

        await fireEvent.click(screen.getByText("emit 2"));
        expect(onValue).has.been.calledOnceWith(2);
        resetHistory();
      },
    ]),
  );
});
