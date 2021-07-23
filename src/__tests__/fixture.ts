import path from "path";
import mocha from "mocha";
import * as chai from "chai";
import domPlugin from "chai-dom";
import sinonPlugin from "sinon-chai";
import promisePlugin from "chai-as-promised";
import createBrowser from "jsdom-context-require";
import { compileFileSync, Config } from "@marko/compiler";
import type * as Testing from "@marko/testing-library";
import type UserEvents from "@testing-library/user-event";
import { VirtualConsole } from "jsdom";
import trySnapshot, { trackError } from "./snapshot";

chai.use(domPlugin);
chai.use(sinonPlugin);
chai.use(promisePlugin);

require.extensions[".marko"] = createMarkoHook("html");

const browser = createBrowser({
  dir: __dirname,
  extensions: { ".marko": createMarkoHook("dom") },
  virtualConsole: new VirtualConsole().sendTo(console, {
    omitJSDOMErrors: true,
  }),
} as any);

browser.window.onerror = trackError as any;
browser.window.onunhandledrejection = trackError as any;
process.on("uncaughtException", trackError);
process.on("unhandledRejection", trackError);

for (const key in mocha) {
  if (key in global) {
    browser.window[key] = (global as any)[key];
  }
}

const targets = {
  node: require,
  web: browser.require,
} as const;

export type FixtureHelpers = Testing.RenderResult &
  typeof Testing & { expect: typeof chai.expect } & {
    fireEvent: typeof Testing["fireEvent"] & typeof UserEvents;
  };
type Step =
  | Record<string, unknown>
  | ((helpers: FixtureHelpers) => Promise<unknown> | unknown);

export default (
  file: string,
  stepsOrInput?: Step[] | Step | Record<string, unknown>
) => {
  const dir = calldir();
  let [input, ...steps] = Array.isArray(stepsOrInput)
    ? stepsOrInput
    : [stepsOrInput];

  if (typeof input === "function") {
    steps = [input, ...steps];
    input = undefined;
  }

  input ||= {};
  file = path.resolve(dir, file);

  return () => {
    for (const target in targets) {
      const load = targets[target as keyof typeof targets];
      const currentTest = it(target, async function () {
        const userEvents = load("@testing-library/user-event")
          .default as typeof UserEvents;
        const helpers = load("@marko/testing-library") as typeof Testing;
        const title = getTitle(currentTest);

        await trySnapshot(
          dir,
          path.join(title, target),
          async ({ title, snapshot }) => {
            title("compile");

            const template = load(file);

            title("render");

            const fixtureHelpers = {
              expect: chai.expect,
              ...helpers,
              fireEvent: {
                ...helpers.fireEvent,
                ...userEvents,
              },
              ...(await helpers.render(template, input)),
            } as FixtureHelpers;

            await snapshot("html", fixtureHelpers.container);

            if (target !== "node") {
              for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                title(`step-${i}`);
                if (typeof step === "function") {
                  await step(fixtureHelpers);
                } else {
                  await fixtureHelpers.rerender(step);
                }

                await snapshot("html", fixtureHelpers.container);
              }
            }
          }
        );
      });
    }
  };
};

function createMarkoHook(output: Config["output"]) {
  return (module: any, filename: string) => {
    module._compile!(
      compileFileSync(filename, {
        output,
        meta: true,
        modules: "cjs",
        optimize: false,
        sourceMaps: "inline",
      } as any).code,
      filename
    );
  };
}

function getTitle(test: Mocha.Test) {
  let parent = test.parent;
  let title = "";

  while (parent) {
    title = path.join(
      parent.title.replace(/[^a-z0-9$_-]+/gi, "-").replace(/^-|-$/, ""),
      title
    );
    parent = parent.parent;
  }

  return title;
}

function calldir() {
  const { stackTraceLimit, prepareStackTrace } = Error;

  try {
    const err = {} as any;
    Error.stackTraceLimit = 2;
    Error.prepareStackTrace = (_, stack) => stack;
    Error.captureStackTrace(err, calldir);
    return path.dirname(err.stack[1].getFileName());
  } finally {
    Error.stackTraceLimit = stackTraceLimit;
    Error.prepareStackTrace = prepareStackTrace;
  }
}
