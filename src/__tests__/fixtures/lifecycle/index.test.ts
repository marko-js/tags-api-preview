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
  ]),
);

describe(
  "<lifecycle> individual handlers",
  fixture("./templates/individual-handlers.marko", [
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
  ]),
);

describe(
  "<lifecycle> multiple",
  fixture("./templates/multiple.marko", [
    { onCount, onMount, onDestroy },
    async ({ expect, screen, rerender, cleanup, fireEvent }) => {
      expect(onMount).has.been.calledTwice;
      expect(onCount).has.not.been.called;
      expect(onDestroy).has.not.been.called;
      resetHistory();

      await fireEvent.click(screen.getByText("increment"));
      expect(onCount).calledTwice;
      expect(onMount).has.not.been.called;
      expect(onDestroy).has.not.been.called;
      resetHistory();

      await rerender();
      expect(onMount).has.not.been.called;
      expect(onCount).has.not.been.called;
      expect(onDestroy).has.not.been.called;

      cleanup();
      expect(onDestroy).has.been.calledTwice;
      expect(onMount).has.not.been.called;
      expect(onCount).has.not.been.called;
      resetHistory();
    },
  ]),
);

describe("<lifecycle> error args", fixture("./templates/error-args.marko"));

describe(
  "<lifecycle> error body content",
  fixture("./templates/error-body-content.marko"),
);

describe(
  "<lifecycle> error extra attr",
  fixture("./templates/error-extra-attr.marko"),
);

describe(
  "<lifecycle> error no attrs",
  fixture("./templates/error-no-attrs.marko"),
);

describe(
  "<lifecycle> error spread attr",
  fixture("./templates/error-spread-attr.marko"),
);

describe(
  "<lifecycle> error tag parameters",
  fixture("./templates/error-tag-parameters.marko"),
);

describe(
  "<lifecycle> error tag var",
  fixture("./templates/error-tag-var.marko"),
);
