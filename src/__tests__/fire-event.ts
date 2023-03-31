import { fireEvent, act } from "@marko/testing-library";
import userEvent from "@testing-library/user-event";

// Wraps all "user events" with Markos `act` helper and merges in with the fireEvent helpers.

type Promisify<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => Promise<ReturnType<T>>;

export default {
  ...fireEvent,
  ...(Object.fromEntries(
    Object.entries(userEvent).map(([k, v]) => {
      if (typeof v === "function") {
        return [k, (...args: unknown[]) => act(() => (v as any)(...args))];
      }
      return [k, v];
    })
  ) as unknown as {
    [Key in keyof typeof userEvent]: Promisify<(typeof userEvent)[Key]>;
  }),
};
