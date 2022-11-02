import { spy, resetHistory } from "sinon";
import fixture from "../../fixture";

const valueChange = spy();

describe(
  "<get> & <set> self reference",
  fixture("./templates/self-reference.marko")
);

describe(
  "<get> read & assign to missing context",
  fixture("./templates/missing-context.marko", [
    async ({ screen, fireEvent }) => {
      await fireEvent.click(screen.getByText("increment"));
    },
  ])
);

describe(
  "<get> & <set> assign to mutable set",
  fixture("./templates/assign-to-mutable-set.marko", [
    { valueChange },
    async ({ expect, screen, rerender, fireEvent }) => {
      expect(valueChange).has.not.been.called;

      await fireEvent.click(screen.getByText("increment"));
      expect(valueChange).calledOnceWith(2);
      resetHistory();

      await rerender();
      expect(valueChange).has.not.been.called;
    },
  ])
);

describe(
  "<get> & <set> assign to nested mutable set",
  fixture("./templates/assign-to-nested-mutable-set.marko", [
    { valueChange },
    async ({ expect, screen, rerender, fireEvent }) => {
      expect(valueChange).has.not.been.called;

      await fireEvent.click(screen.getByText("increment"));
      expect(valueChange).calledOnceWith(2);
      resetHistory();

      await rerender();
      expect(valueChange).has.not.been.called;
    },
  ])
);

describe(
  "<get> & <set> assign to const set",
  fixture("./templates/assign-to-const-set.marko", [
    async ({ screen, fireEvent }) => {
      await fireEvent.click(screen.getByText("increment"));
    },
  ])
);

describe(
  "<get> & <set> assign to nested const set",
  fixture("./templates/assign-to-nested-const-set.marko", [
    async ({ screen, fireEvent }) => {
      await fireEvent.click(screen.getByText("increment"));
    },
  ])
);

describe(
  "<get> & <set> update provided value",
  fixture("./templates/update-provided-value/index.marko", [
    async ({ screen, fireEvent }) => {
      await fireEvent.click(screen.getByText("increment"));
    },
  ])
);

describe(
  "<get> & <set> reference by tag name",
  fixture("./templates/reference-by-tag-name/index.marko")
);

describe(
  "<get> & <set> provide through single child",
  fixture("./templates/provide-direct-child/index.marko")
);

describe(
  "<get> & <set> provide through multiple children",
  fixture("./templates/provide-across-children/index.marko")
);

describe(
  "<get> global context",
  fixture("./templates/get-global-context.marko", {
    $global: { message: "hello" },
  })
);

describe("error <get> args", fixture("./templates/error-get-args.marko"));

describe(
  "error <get> body content",
  fixture("./templates/error-get-body-content.marko")
);

describe(
  "error <get> body parameters",
  fixture("./templates/error-get-body-parameters.marko")
);

describe(
  "error <get> extra attr",
  fixture("./templates/error-get-extra-attr.marko")
);

describe(
  "<get> mutate global context",
  fixture("./templates/error-assign-global-context.marko")
);

describe(
  "error <get> missing tag",
  fixture("./templates/error-get-missing-tag.marko")
);

describe(
  "error <get> no tag var",
  fixture("./templates/error-get-no-tag-var.marko")
);

describe("error <set> args", fixture("./templates/error-set-args.marko"));

describe(
  "error <set> body parameters",
  fixture("./templates/error-set-body-parameters.marko")
);

describe(
  "error <set> extra attr",
  fixture("./templates/error-set-extra-attr.marko")
);

describe(
  "error <set> no content",
  fixture("./templates/error-set-no-content.marko")
);

describe(
  "error <set> no default attr",
  fixture("./templates/error-set-no-default-attr.marko")
);

describe(
  "error <set> spread attr",
  fixture("./templates/error-set-spread-attr.marko")
);

describe("error <set> tag var", fixture("./templates/error-set-tag-var.marko"));
