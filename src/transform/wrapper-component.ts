import { types as t } from "@marko/compiler";
import { isNativeTag, getTagDef } from "@marko/babel-utils";
import { taglibId } from "../../marko.json";
import isCoreTag from "../util/is-core-tag";
import isApi from "../util/is-api";

export type Meta = {
  component: t.Identifier;
  state: t.Identifier;
  stateIndex: number;
  refIndex: number;
  varIndex: number;
};

const lifecycleRootsForProgram = new WeakMap<
  t.NodePath<t.Program>,
  Set<t.NodePath<any>>
>();
const tagsNeedingLifecycle = new Set([
  "id",
  "let",
  "get",
  "set",
  "effect",
  "return",
  "lifecycle",
]);

export function closest(path: t.NodePath<any>) {
  let root = path;

  do {
    const { node } = root;

    if (!node) {
      return;
    }

    const { extra } = node;
    if (extra) {
      const meta = extra.___lifecycle;
      if (meta) {
        return meta as Meta;
      }
    }

    root = root.parentPath;
  } while (root);
}

export default {
  Program: {
    enter(program: t.NodePath<t.Program>) {
      if (isApi(program, "tags")) {
        lifecycleRootsForProgram.set(program, new Set());
      }
    },
    exit(program: t.NodePath<t.Program>) {
      if (isApi(program, "tags")) {
        for (const root of lifecycleRootsForProgram.get(program)!) {
          if (root === program) {
            program.node.body = buildRootLifecycle(program).concat(
              program.node.body
            );
          } else {
            root.node.body.body = buildNestedLifecycle(root);
          }
        }
      }
    },
  },
  MarkoTag(tag: t.NodePath<t.MarkoTag>) {
    const tagDef = getTagDef(tag);

    if (tagDef && tagDef.taglibId === taglibId) {
      if (tagsNeedingLifecycle.has(tagDef.name)) {
        ensureLifecycle(tag);
      }
    } else if (tag.node.var) {
      ensureLifecycle(tag);
    }
  },
};

export function ensureLifecycle(tag: t.NodePath<t.MarkoTag>) {
  const program = tag.hub.file.path;
  let root = tag as t.NodePath;
  while (
    (root = root.parentPath) !== program &&
    (root = root.parentPath).node &&
    isNativeTag(root as t.NodePath<t.MarkoTag>)
  );

  if (root.node) {
    const roots = lifecycleRootsForProgram.get(program)!;

    if (!roots.has(root)) {
      const extra = root.node.extra;
      const meta: Meta = {
        component: root.scope.generateUidIdentifier("component"),
        state: root.scope.generateUidIdentifier("state"),
        stateIndex: 0,
        refIndex: 0,
        varIndex: 0,
      };

      roots.add(root);

      if (extra) {
        extra.___lifecycle = meta;
      } else {
        root.node.extra = { ___lifecycle: meta };
      }
    }

    return root.node.extra!.___lifecycle as Meta;
  }
}

function buildRootLifecycle(program: t.NodePath<t.Program>): t.Statement[] {
  const meta = program.node.extra!.___lifecycle as Meta;
  return [
    t.markoClass(
      t.classBody([
        t.classMethod(
          "method",
          t.identifier("onCreate"),
          [],
          t.blockStatement([
            t.expressionStatement(
              t.assignmentExpression(
                "=",
                t.memberExpression(t.thisExpression(), t.identifier("state")),
                t.objectExpression([])
              )
            ),
          ])
        ),
      ])
    ),
    t.markoScriptlet([
      t.variableDeclaration("var", [
        t.variableDeclarator(meta.component, t.identifier("component")),
        t.variableDeclarator(meta.state, t.identifier("state")),
      ]),
    ]),
  ];
}

function buildNestedLifecycle(tag: t.NodePath<t.MarkoTag>): t.Statement[] {
  const meta = tag.node.extra!.___lifecycle as Meta;
  return [
    t.markoTag(
      t.stringLiteral("_instance"),
      [],
      t.markoTagBody(tag.node.body.body, [
        tag.scope.generateUidIdentifier("nestedComponentDef"),
        meta.component,
        meta.state,
      ])
    ),
  ];
}

function isIgnoredTag(tag: t.NodePath<t.MarkoTag>) {
  return isCoreTag("attrs", tag) || isCoreTag("const", tag);
}
