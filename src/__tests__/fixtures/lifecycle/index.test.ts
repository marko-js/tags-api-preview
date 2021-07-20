import { spy, resetHistory } from "sinon";
import fixture from "../../fixture";
const onCount = spy();
const onMount = spy();
const onDestroy = spy();

describe(
  "<lifecycle> basic",
  fixture("./templates/basic.marko", [
    { onCount, onMount, onDestroy },
    async ({ expect, screen, rerender, cleanup, fireEvent }) => {
      expect(onMount).has.been.calledOnce;
      expect(onCount).has.not.been.called;
      expect(onDestroy).has.not.been.called;
      resetHistory();

      await fireEvent.click(screen.getByText("increment"));
      expect(onCount).calledOnceWith(1);
      expect(onMount).has.not.been.called;
      expect(onDestroy).has.not.been.called;
      resetHistory();

      await rerender();
      expect(onMount).has.not.been.called;
      expect(onCount).has.not.been.called;
      expect(onDestroy).has.not.been.called;

      cleanup();
      expect(onDestroy).has.been.calledOnce;
      expect(onMount).has.not.been.called;
      expect(onCount).has.not.been.called;
      resetHistory();
    },
  ])
);
