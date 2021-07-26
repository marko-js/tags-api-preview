import fixture from "../../../fixture";

describe("misc native tag change handlers", () => {
  describe(
    "text input",
    fixture("./templates/text-input.marko", [
      async ({ screen, fireEvent }) => {
        await fireEvent.type(screen.getByDisplayValue("Hello"), " World", {
          delay: 0,
        });
      },
    ])
  );

  describe(
    "checkbox input",
    fixture("./templates/checkbox-input.marko", [
      async ({ screen, fireEvent }) => {
        await fireEvent.click(screen.getByRole("checkbox"));
      },
    ])
  );

  describe(
    "text input spread",
    fixture("./templates/text-input-spread.marko", [
      async ({ screen, fireEvent }) => {
        await fireEvent.type(screen.getByDisplayValue("Hello"), " World", {
          delay: 0,
        });
      },
    ])
  );

  describe(
    "checkbox input spread",
    fixture("./templates/checkbox-input-spread.marko", [
      async ({ screen, fireEvent }) => {
        await fireEvent.click(screen.getByRole("checkbox"));
      },
    ])
  );
});
