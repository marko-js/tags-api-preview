import { spy, resetHistory } from "sinon";
import fixture, { FixtureHelpers } from "../../fixture";

const valueChange = spy();
const increment = click("Increment");

describe(
  "<let> basic",
  fixture("./templates/basic.marko", [{ value: 1 }, increment, increment])
);

describe(
  "<let> with default change",
  fixture("./templates/with-default-change.marko", [
    { value: 1, valueChange },
    async (helpers) => {
      await increment(helpers);
      helpers.expect(valueChange).to.have.been.calledOnceWith(2);
      resetHistory();
    },
    { value: 2, valueChange },
    { value: 1 },
    async (helpers) => {
      await increment(helpers);
      helpers.expect(valueChange).has.not.been.called;
      resetHistory();
    },
  ])
);

describe(
  "<let> hoisted",
  fixture("./templates/hoisted.marko", [{ value: 1 }, increment, increment])
);

describe(
  "<let> within-condition",
  fixture("./templates/within-condition.marko", [
    { show: true, value: 0 },
    increment,
    increment,
    { show: false },
    { show: true, value: 1 },
    increment,
  ])
);

describe(
  "<let> within-loop",
  fixture("./templates/within-loop.marko", [
    {
      a: 1,
      b: 2,
      c: 3,
    },
    click("Increment a"),
    click("Increment b"),
    click("Increment c"),
    {
      a: 1,
      b: 2,
    },
    click("Increment a"),
  ])
);

describe("<let> error args", fixture("./templates/error-args.marko"));

describe(
  "<let> error body content",
  fixture("./templates/error-body-content.marko")
);

describe(
  "<let> error body parameters",
  fixture("./templates/error-body-parameters.marko")
);

describe(
  "<let> error destructured",
  fixture("./templates/error-destructured.marko")
);

describe(
  "<let> error extra attr",
  fixture("./templates/error-extra-attr.marko")
);

describe(
  "<let> error no default attr",
  fixture("./templates/error-no-default-attr.marko")
);

describe(
  "<let> error no tag var",
  fixture("./templates/error-no-tag-var.marko")
);

function click(text: string) {
  return async ({ fireEvent, screen }: FixtureHelpers) =>
    await fireEvent.click(screen.getByText(text));
}
