import fixture from "../../../fixture";

describe("misc native tag change handlers", () => {
  describe(
    "text input",
    fixture("./templates/text-input.marko", [
      async ({ fireEvent, screen, act }) => {
        await act(() =>
          fireEvent.type(screen.getByDisplayValue("Hello"), " World")
        );
      },
    ])
  );

  describe(
    "checkbox input",
    fixture("./templates/checkbox-input.marko", [
      async ({ screen, act }) => {
        await act(() => screen.getByRole("checkbox").click());
      },
    ])
  );

  describe(
    "text input spread",
    fixture("./templates/text-input-spread.marko", [
      async ({ fireEvent, screen, act }) => {
        await act(() =>
          fireEvent.type(screen.getByDisplayValue("Hello"), " World")
        );
      },
    ])
  );

  describe(
    "checkbox input spread",
    fixture("./templates/checkbox-input-spread.marko", [
      async ({ screen, act }) => {
        await act(() => screen.getByRole("checkbox").click());
      },
    ])
  );
});
