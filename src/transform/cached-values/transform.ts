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
  parent: t.Node;
  node: t.Node;
  parentTag: t.NodePath;
  deps: Deps | undefined;
  shouldCache: boolean;
}

const depsVisitor = {
  enter(path, state) {
    if (path.parent === state.parent && path.node !== state.node) {
      path.skip();
    }
  },
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
        ? binding.path.isMarkoTag()
          ? !(
              binding.path === state.parentTag ||
              isNativeTag(binding.path) ||
              isDynamicTag(binding.path)
            )
          : name === "input" && binding.path.isProgram()
        : name === "input" || name === "$global"
    ) {
      let deps = state.deps || (state.deps = {});
      let parent = identifier.parentPath;

      do {
        const curDeps = deps[name];
        if (curDeps === true) return;

        if (parent.isMemberExpression()) {
          const literalName = getPropertyNameLiteral(parent.node);
          if (
            literalName !== undefined &&
            !(
              parent.parentPath.isCallExpression() &&
              parent.parentPath.node.callee === parent.node &&
              !isEventHandlerName(literalName)
            )
          ) {
            parent = parent.parentPath;
            deps = curDeps || (deps[name] = {} as Deps);
            name = literalName;
            continue;
          }
        }

        deps[name] = true;
        return;
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
  exprPath: t.NodePath<any>,
) {
  const parentPath = exprPath.parentPath!;
  const state: DepsVisitorState = {
    parentTag,
    node: exprPath.node,
    parent: parentPath.node,
    deps: undefined,
    shouldCache: false,
  };
  parentPath.traverse(depsVisitor, state);

  if (state.shouldCache) {
    const { file } = exprPath.hub;
    const { component } = ensureLifecycle(parentTag)!;
    exprPath
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
                ],
              ),
              exprPath.node,
            ),
          ],
        ),
      )[0]
      .skip();
  }
}

function* getDefaultExpressions(
  val: t.NodePath<any>,
): Generator<t.NodePath<t.Expression>, void> {
  switch (val.node.type) {
    case "ArrayPattern":
      for (const item of (val as t.NodePath<t.ArrayPattern>).get("elements")) {
        yield* getDefaultExpressions(item);
      }
      break;
    case "ObjectPattern":
      for (const prop of (val as t.NodePath<t.ObjectPattern>).get(
        "properties",
      )) {
        if (prop.node.type === "RestElement") continue;
        yield* getDefaultExpressions(
          (prop as t.NodePath<t.ObjectProperty>).get("value"),
        );
      }
      break;
    case "AssignmentPattern":
      yield (val as t.NodePath<t.AssignmentPattern>).get("right");
      break;
  }
}

function getPropertyNameLiteral(memberExpression: t.MemberExpression) {
  if (memberExpression.computed) {
    if (isStringOrNumericLiteral(memberExpression.property.type)) {
      return (
        (memberExpression.property as t.StringLiteral | t.NumericLiteral)
          .value + ""
      );
    }
  } else if (memberExpression.property.type === "Identifier") {
    return memberExpression.property.name;
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

function isEventHandlerName(name: string) {
  return /^on[A-Z]/.test(name);
}

function toDepsArray(
  deps: Deps,
  object?: t.Expression,
  arr: (t.Identifier | t.MemberExpression)[] = [],
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
