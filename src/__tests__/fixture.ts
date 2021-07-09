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

const targets = {
  node: require,
  web: browser.require,
} as const;

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
    for (const target in targets) {
      const load = targets[target as keyof typeof targets];
      const currentTest = it(target, async function () {
        const helpers = load("@marko/testing-library") as typeof testing;
        const title = getTitle(currentTest);
        let template: any;
        let renderResult: testing.RenderResult;

        try {
          template = load(file);
        } catch (err) {
          snapshot(dir, path.join(title, `${target}.compile-error.txt`), err);
          return;
        }

        try {
          renderResult = await helpers.render(template, input);
        } catch (err) {
          snapshot(dir, path.join(title, `${target}.render-error.txt`), err);
          return;
        }

        const fixtureHelpers = {
          expect: chai.expect,
          ...helpers,
          ...renderResult,
        } as FixtureHelpers;

        snapshot(
          dir,
          path.join(title, `${target}.render.html`),
          fixtureHelpers.container
        );

        if (target !== "node") {
          for (let i = 0; i < steps.length; i++) {
            const step = steps[i];

            try {
              if (typeof step === "function") {
                await step(fixtureHelpers);
              } else {
                await fixtureHelpers.rerender(step);
              }
            } catch (err) {
              snapshot(
                dir,
                path.join(title, `${target}.step-${i}-error.txt`),
                err
              );
              return;
            }

            snapshot(
              dir,
              path.join(title, `${target}.step-${i}.html`),
              fixtureHelpers.container
            );
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
