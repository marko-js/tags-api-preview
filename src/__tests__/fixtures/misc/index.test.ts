import { spy, resetHistory } from "sinon";
import fixture, { FixtureHelpers } from "../../fixture";

const increment = click("increment");
const onValue = spy();

describe("misc assign", () => {
  describe(
    "with default",
    fixture("./templates/assign-with-default.marko", [increment, increment])
  );

  describe(
    "with computed",
    fixture("./templates/assign-with-computed.marko", [increment, increment])
  );

  describe(
    "with default and rest",
    fixture("./templates/assign-with-default-and-rest.marko", [
      increment,
      increment,
    ])
  );

  describe(
    "with string-literal",
    fixture("./templates/assign-with-string-literal.marko", [
      increment,
      increment,
    ])
  );

  describe(
    "with existing change handler",
    fixture("./templates/assign-with-existing-change-handler.marko", [
      increment,
      increment,
    ])
  );

  describe(
    "error assign-to-rest-element",
    fixture("./templates/error-assign-to-rest-element.marko")
  );

  describe(
    "error assign-to-array-item",
    fixture("./templates/error-assign-to-array-item.marko")
  );

  describe(
    "error assign-to-tag-param",
    fixture("./templates/error-assign-to-tag-param.marko")
  );
});

describe("misc feature detect", () => {
  describe(
    "class by default",
    fixture("./templates/feature-detect-class-by-default.marko")
  );

  describe(
    "tags comment directive",
    fixture("./templates/feature-detect-tags-comment-directive.marko")
  );

  describe("tags var", fixture("./templates/feature-detect-tags-var.marko"));

  describe(
    "tags new tag",
    fixture("./templates/feature-detect-tags-new-tag.marko")
  );

  describe(
    "error arg events",
    fixture("./templates/error-feature-detect-arg-events.marko")
  );

  describe(
    "error attr modifier",
    fixture("./templates/error-feature-detect-attr-modifier.marko")
  );

  describe(
    "error class block",
    fixture("./templates/error-feature-detect-class-block.marko")
  );

  describe(
    "error legacy attrs",
    fixture("./templates/error-feature-detect-legacy-attrs.marko")
  );

  describe(
    "error legacy tag",
    fixture("./templates/error-feature-detect-legacy-tag.marko")
  );

  describe(
    "error reference component",
    fixture("./templates/error-feature-detect-reference-component.marko")
  );

  describe(
    "error reference input",
    fixture("./templates/error-feature-detect-reference-input.marko")
  );

  describe(
    "error reference out",
    fixture("./templates/error-feature-detect-reference-out.marko")
  );

  describe(
    "error scriptlet",
    fixture("./templates/error-feature-detect-scriptlet.marko")
  );
});

describe("misc hoisting", () => {
  describe(
    "async read before",
    fixture("./templates/hoisting-async-read-before.marko", [
      { onValue },
      ({ expect }) => {
        expect(onValue).to.have.been.calledOnceWith(1);
        resetHistory();
      },
    ])
  );

  describe(
    "sync read after",
    fixture("./templates/hoisting-sync-read-after.marko")
  );

  describe(
    "error assign before",
    fixture("./templates/error-hoisting-assign-before.marko")
  );

  describe(
    "error assign after",
    fixture("./templates/error-hoisting-assign-after.marko")
  );

  describe(
    "error sync read before",
    fixture("./templates/error-hoisting-sync-read-before.marko")
  );

  describe(
    "error sync read before in iife",
    fixture("./templates/error-hoisting-sync-read-before-in-iife.marko")
  );

  describe(
    "error maybe sync read before",
    fixture("./templates/error-hoisting-maybe-sync-read-before.marko")
  );

  describe(
    "error maybe sync read before with custom tag",
    fixture(
      "./templates/error-hoisting-maybe-sync-read-before-with-custom-tag.marko"
    )
  );
});

function click(text: string) {
  return async ({ fireEvent, screen }: FixtureHelpers) =>
    await fireEvent.click(screen.getByText(text));
}
