import { spy, resetHistory } from "sinon";
import fixture from "../../../fixture";

const onValue = spy();

describe("misc hoisting", () => {
  describe(
    "async read before",
    fixture("./templates/hoisting-async-read-before.marko", [
      { onValue },
      ({ expect }) => {
        expect(onValue).to.have.been.calledOnceWith(1);
        resetHistory();
      },
      {},
      ({ expect }) => {
        expect(onValue).not.to.have.been.called;
        resetHistory();
      },
    ])
  );

  describe(
    "sync read after",
    fixture("./templates/hoisting-sync-read-after.marko")
  );

  describe(
    "multiple maybe async read before",
    fixture(
      "./templates/hoisting-multiple-maybe-async-read-before-with-custom-tag.marko",
      [
        { onValue },
        ({ expect }) => {
          expect(onValue).to.have.been.calledOnceWith(3);
          resetHistory();
        },
        {},
        ({ expect }) => {
          expect(onValue).not.to.have.been.called;
          resetHistory();
        },
      ]
    )
  );

  describe(
    "maybe async read before",
    fixture(
      "./templates/hoisting-maybe-async-read-before-with-custom-tag.marko",
      [
        { onValue },
        ({ expect }) => {
          expect(onValue).to.have.been.calledOnceWith(1);
          resetHistory();
        },
      ]
    )
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
