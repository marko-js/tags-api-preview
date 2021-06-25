import { spy, resetHistory } from "sinon";
import fixture from "../../fixture";
const onCount = spy();
const onCleanup = spy();

describe(
  "<effect> basic",
  fixture("./templates/basic.marko", [
    { onCount, onCleanup },
    async ({ expect, screen, rerender, cleanup, fireEvent }) => {
      expect(onCount).calledOnceWith(0);
      expect(onCleanup).has.not.been.called;
      resetHistory();

      await fireEvent.click(screen.getByText("increment"));
      expect(onCount).calledOnceWith(1);
      expect(onCleanup).has.been.calledOnce;
      resetHistory();

      await rerender();
      expect(onCount).has.not.been.called;
      expect(onCleanup).has.not.been.called;

      cleanup();
      expect(onCleanup).has.been.calledOnce;
    },
  ])
);

describe(
  "<effect> within-condition",
  fixture("./templates/within-condition.marko", [
    { onCount, onCleanup, show: true, count: 0 },
    async ({ expect, screen, rerender, fireEvent }) => {
      expect(onCount).calledOnceWith(0);
      expect(onCleanup).has.not.been.called;
      resetHistory();

      await fireEvent.click(screen.getByText("increment"));
      expect(onCount).calledOnceWith(1);
      expect(onCleanup).has.been.calledOnce;
      resetHistory();

      await rerender({ onCount, onCleanup, show: false });
      expect(onCount).has.not.been.called;
      expect(onCleanup).has.been.calledOnce;
      resetHistory();

      await rerender({ onCount, onCleanup, show: true, count: 3 });
      expect(onCount).calledOnceWith(3);
      expect(onCleanup).has.not.been.called;
    },
  ])
);
