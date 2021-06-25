import path from "path";
import mocha from "mocha";
import * as chai from "chai";
import domPlugin from "chai-dom";
import sinonPlugin from "sinon-chai";
import promisePlugin from "chai-as-promised";
import createBrowser from "jsdom-context-require";
import { compileFileSync, Config } from "@marko/compiler";
import type * as testing from "@marko/testing-library";
import snapshot from "./snapshot";

chai.use(domPlugin);
chai.use(sinonPlugin);
chai.use(promisePlugin);

require.extensions[".marko"] = createMarkoHook("html");
const browser = createBrowser({
  dir: __dirname,
  extensions: { ".marko": createMarkoHook("dom") },
});

for (const key in mocha) {
  if (key in global) {
    browser.window[key] = (global as any)[key];
  }
}

const environments = [
  {
    name: "node",
    global,
    require,
  },
  {
    name: "web",
    global: browser.window,
    require: browser.require,
  },
] as const;

export type FixtureHelpers = testing.RenderResult &
  typeof testing & { expect: typeof chai.expect };
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
    for (const env of environments) {
      const currentTest = it(env.name, async function () {
        const helpers = env.require("@marko/testing-library") as typeof testing;
        const template = env.require(file);
        const title = getTitle(currentTest);
        let renderResult: testing.RenderResult;

        try {
          renderResult = await helpers.render(template, input);
        } catch (err) {
          snapshot(dir, `${title}-initial-render-error.txt`, err);
          return;
        }

        const fixtureHelpers = {
          expect: chai.expect,
          ...helpers,
          ...renderResult,
        } as FixtureHelpers;

        snapshot(dir, `${title}-initial-render.html`, fixtureHelpers.container);

        if (env.name !== "node") {
          for (let i = 0; i < steps.length; i++) {
            const step = steps[i];

            try {
              if (typeof step === "function") {
                await step(fixtureHelpers);
              } else {
                await fixtureHelpers.rerender(step);
              }
            } catch (err) {
              snapshot(dir, `${title}-step-${i}-error.txt`, err);
              return;
            }

            snapshot(dir, `${title}-step-${i}.html`, fixtureHelpers.container);
          }
        }
      });
    }
  };
};

function createMarkoHook(output: Config["output"]) {
  return (module: any, filename: string) => {
    module._compile!(
      compileFileSync(filename, {
        output,
        modules: "cjs",
        optimize: false,
        sourceMaps: "inline",
      }).code,
      filename
    );
  };
}

function getTitle(test: Mocha.Test) {
  let parent = test.parent;
  let title = test.title;

  while (parent) {
    title = `${parent.title} ${title}`;
    parent = parent.parent;
  }

  return title.replace(/[^a-z0-9_-]+/g, "__").replace(/^__|__$/, "");
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
