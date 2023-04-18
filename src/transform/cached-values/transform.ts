import { isNativeTag, isDynamicTag } from "@marko/babel-utils";
import { types as t } from "@marko/compiler";
import { importRuntimeNamed } from "../../util/import-runtime";
import isApi from "../../util/is-api";
import { ensureLifecycle } from "../wrapper-component";
import isCoreTag from "../../util/is-core-tag";

interface Deps {
  [x: string]: Deps | true;
}

interface DepsVisitorState {
  parentTag: t.NodePath;
  deps: Deps | undefined;
  shouldCache: boolean;
}

const depsVisitor = {
  Function(_, state) {
    state.shouldCache = true;
  },
  TaggedTemplateExpression(_, state) {
    state.shouldCache = true;
  },
  ObjectExpression(_, state) {
    state.shouldCache = true;
  },
  ArrayExpression(_, state) {
    state.shouldCache = true;
  },
  CallExpression(_, state) {
    state.shouldCache = true;
  },
  NewExpression(_, state) {
    state.shouldCache = true;
  },
  ReferencedIdentifier: ((identifier, state) => {
    let { name } = identifier.node;
    const binding = identifier.scope.getBinding(name);

    if (
      binding
        ? binding.path.isMarkoTag() &&
          !(
            binding.path === state.parentTag ||
            isNativeTag(binding.path) ||
            isDynamicTag(binding.path)
          )
        : name === "input" || name === "$global"
    ) {
      let deps = state.deps || (state.deps = {});
      let parent = identifier.parentPath;

      do {
        const curDeps = deps[name];
        if (curDeps === true) return;

        if (
          parent.isMemberExpression() &&
          (!parent.node.computed ||
            isStringOrNumericLiteral(parent.node.property.type))
        ) {
          const prop = parent.node.property as
            | t.Identifier
            | t.StringLiteral
            | t.NumericLiteral;
          parent = parent.parentPath;
          deps = curDeps || (deps[name] = {} as Deps);
          name = prop.type === "Identifier" ? prop.name : prop.value + "";
        } else {
          deps[name] = true;
          return;
        }
        // eslint-disable-next-line no-constant-condition
      } while (true);
    }
  }) as t.Visitor<DepsVisitorState>["Identifier"],
} as t.Visitor<DepsVisitorState>;

export default {
  MarkoTag(tag) {
    if (isApi(tag, "class") || isNativeTag(tag) || isCoreTag("let", tag)) {
      return;
    }

    if (tag.node.var) {
      for (const expr of getDefaultExpressions(tag.get("var"))) {
        cacheExprIfNeeded(tag, expr);
      }
    }

    if (tag.node.body.params?.length) {
      for (const param of tag
        .get("body")
        .get("params") as t.NodePath<t.LVal>[]) {
        for (const expr of getDefaultExpressions(param)) {
          cacheExprIfNeeded(tag, expr);
        }
      }
    }

    if (tag.node.attributes.length) {
      for (const attr of tag.get("attributes")) {
        switch (attr.node.type) {
          case "MarkoAttribute":
          case "MarkoSpreadAttribute":
            cacheExprIfNeeded(tag, attr.get("value"));
            break;
        }
      }
    }
  },
} as t.Visitor;

function cacheExprIfNeeded(
  parentTag: t.NodePath<t.MarkoTag>,
  expr: t.NodePath<any>
) {
  const state: DepsVisitorState = {
    parentTag,
    deps: undefined,
    shouldCache: false,
  };
  expr.traverse(depsVisitor, state);

  if (state.shouldCache) {
    const { file } = expr.hub;
    const { component } = ensureLifecycle(parentTag)!;
    expr
      .replaceWith(
        t.callExpression(
          importRuntimeNamed(file, "transform/cached-values", "cache"),
          [
            t.logicalExpression(
              "||",
              t.callExpression(
                importRuntimeNamed(file, "transform/cached-values", "cached"),
                [
                  component,
                  t.arrayExpression(state.deps ? toDepsArray(state.deps) : []),
                ]
              ),
              expr.node
            ),
          ]
        )
      )[0]
      .skip();
  }
}

function* getDefaultExpressions(
  val: t.NodePath<any>
): Generator<t.NodePath<t.Expression>, void> {
  switch (val.node.type) {
    case "ArrayPattern":
      for (const item of (val as t.NodePath<t.ArrayPattern>).get("elements")) {
        yield* getDefaultExpressions(item);
      }
      break;
    case "ObjectPattern":
      for (const prop of (val as t.NodePath<t.ObjectPattern>).get(
        "properties"
      )) {
        if (prop.node.type === "RestElement") continue;
        yield* getDefaultExpressions(
          (prop as t.NodePath<t.ObjectProperty>).get("value")
        );
      }
      break;
    case "AssignmentPattern":
      yield (val as t.NodePath<t.AssignmentPattern>).get("right");
      break;
  }
}

function isStringOrNumericLiteral(type: string) {
  switch (type) {
    case "StringLiteral":
    case "NumericLiteral":
      return true;
    default:
      return false;
  }
}

function toDepsArray(
  deps: Deps,
  object?: t.Expression,
  arr: (t.Identifier | t.MemberExpression)[] = []
) {
  for (const name in deps) {
    const dep = deps[name];
    const node = object
      ? t.memberExpression(object, t.stringLiteral(name), true)
      : t.identifier(name);

    if (dep === true) {
      arr.push(node);
    } else {
      toDepsArray(dep, node, arr);
    }
  }

  return arr;
}
