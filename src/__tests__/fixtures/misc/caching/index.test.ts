import { resetHistory, spy } from "sinon";
import fixture, { type FixtureHelpers } from "../../../fixture";
const increment = click("Increment");
const toggle = click("Toggle");

const onRender = spy();

describe("cached", () => {
  beforeEach(() => resetHistory());

  describe(
    "conditional value",
    fixture("./templates/conditional-value.marko", [
      {},
      increment,
      toggle,
      toggle,
      increment,
      toggle,
    ])
  );

  describe(
    "function call",
    fixture("./templates/function-call.marko", [
      { fn: onRender },
      async ({ expect, screen, fireEvent, rerender }) => {
        expect(onRender).calledOnce;
        resetHistory();
        expect(onRender).not.called;

        await fireEvent.click(screen.getByText("increment"));
        expect(onRender).not.called;
        resetHistory();

        await rerender();
        expect(onRender).not.called;
        resetHistory();

        await rerender({ fn: () => onRender() });
        expect(onRender).calledOnce;
        resetHistory();
      },
    ])
  );
});

function click(text: string) {
  return async ({ fireEvent, screen }: FixtureHelpers) =>
    await fireEvent.click(screen.getByText(text));
}
