import { spy, resetHistory } from "sinon";
import fixture from "../../fixture";
const onEl = spy();
const onCount = spy();
const onEffect = spy();
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
      resetHistory();
    },
  ])
);

describe(
  "<effect> multiple",
  fixture("./templates/multiple.marko", [
    { onCount, onCleanup },
    async ({ expect, screen, rerender, cleanup, fireEvent }) => {
      expect(onCount).calledTwice;
      expect(onCleanup).has.not.been.called;
      resetHistory();

      await fireEvent.click(screen.getByText("increment"));
      expect(onCount).calledTwice;
      expect(onCleanup).has.been.calledTwice;
      resetHistory();

      await rerender();
      expect(onCount).has.not.been.called;
      expect(onCleanup).has.not.been.called;

      cleanup();
      expect(onCleanup).has.been.calledTwice;
      resetHistory();
    },
  ])
);

describe(
  "<effect> with native tag ref",
  fixture("./templates/with-native-tag-ref.marko", [
    { onEl },
    async ({ expect, screen }) => {
      expect(onEl).calledOnceWith(screen.getByText("child"));
      resetHistory();
    },
  ])
);

describe(
  "<effect> with hoisted tag ref",
  fixture("./templates/with-hoisted-tag-ref.marko", [
    { onEl },
    async ({ expect, screen }) => {
      expect(onEl).calledOnceWith(screen.getByText("child"));
      resetHistory();
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
      resetHistory();
    },
  ])
);
describe(
  "<effect> missing function",
  fixture("./templates/missing-function.marko", [
    { onEffect },
    async ({ expect, rerender }) => {
      expect(onEffect).to.have.been.calledOnce;
      resetHistory();

      await rerender();
      expect(onEffect).has.not.been.called;
      resetHistory();

      await rerender({ onEffect: undefined });
      expect(onEffect).has.not.been.called;
      resetHistory();

      await rerender({ onEffect });
      expect(onEffect).to.have.been.calledOnce;
    },
  ])
);

describe("<effect> error args", fixture("./templates/error-args.marko"));

describe(
  "<effect> error body content",
  fixture("./templates/error-body-content.marko")
);

describe(
  "<effect> error body parameters",
  fixture("./templates/error-body-parameters.marko")
);

describe(
  "<effect> error extra attrs",
  fixture("./templates/error-extra-attrs.marko")
);

describe(
  "<effect> error no default attr",
  fixture("./templates/error-no-default-attr.marko")
);

describe(
  "<effect> error tag variable",
  fixture("./templates/error-tag-variable.marko")
);
