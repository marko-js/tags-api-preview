import { types as t } from "@marko/compiler";
import getAttr from "../../util/get-attr";
import isApi from "../../util/is-api";

const visited = new WeakSet<t.NodePath<t.MarkoTag>>();

export default function transform(tag: t.NodePath<t.MarkoTag>) {
  if (isApi(tag, "class") || visited.has(tag)) {
    return;
  }

  visited.add(tag);
  const byAttr = getAttr(tag, "by");

  if (!byAttr) {
    return;
  }

  let byId;
  const body = tag.get("body");
  const { scope } = body;
  const idId = scope.generateUidIdentifier("id");
  const params = body.get("params") as any;

  if (byAttr.get("value").isIdentifier()) {
    byId = byAttr.node.value;
  } else {
    byId = tag.parentPath.scope.generateUidIdentifier("by");
    tag.insertBefore(
      t.markoScriptlet([
        t.variableDeclaration("const", [
          t.variableDeclarator(byId, byAttr.node.value),
        ]),
      ])
    );
  }

  const byArgs: t.Expression[] = [];
  const bodyVars: t.VariableDeclarator[] = [];

  for (const param of params) {
    if (param.isIdentifier()) {
      byArgs.push(param.node);
    } else {
      const paramAlias = param.scope.generateUidIdentifier();
      bodyVars.push(t.variableDeclarator(param.node, paramAlias));
      byArgs.push(paramAlias);
    }

    param.remove();
  }

  if (getAttr(tag, "in")) {
    if (params.length < 1) {
      byArgs.push(scope.generateUidIdentifier("key"));
    }

    if (params.length < 2) {
      byArgs.push(scope.generateUidIdentifier("val"));
    }
  } else if (getAttr(tag, "of")) {
    if (params.length < 1) {
      byArgs.push(scope.generateUidIdentifier("val"));
    }

    if (params.length < 2) {
      byArgs.push(scope.generateUidIdentifier("key"));
    }
  } else {
    if (params.length < 1) {
      byArgs.push(scope.generateUidIdentifier("index"));
    }
  }

  body.set("params", byArgs as any);
  bodyVars.push(t.variableDeclarator(idId, t.callExpression(byId, byArgs)));
  const prependScriptlet = t.markoScriptlet([
    t.variableDeclaration("const", bodyVars),
  ]);
  prependScriptlet.extra = { _hoistInInstance: true };
  tag.get("body").unshiftContainer("body", prependScriptlet);
  tag.set("keyScope", idId);
  tag.node.extra ??= {};
  tag.node.extra.keyScope = idId; // Add keyscope to extra so it gets serialized for the translate phase.
  byAttr.remove();
}
