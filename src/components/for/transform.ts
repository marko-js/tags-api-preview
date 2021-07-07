import { types as t } from "@marko/compiler";
import getAttr from "../../util/get-attr";

const visited = new WeakSet<t.NodePath<t.MarkoTag>>();

export = function transform(tag: t.NodePath<t.MarkoTag>) {
  if (visited.has(tag)) {
    return;
  }

  visited.add(tag);
  const byAttr = getAttr(tag, "by");

  if (!byAttr) {
    return;
  }

  let byId;
  const idId = tag.get("body").scope.generateUidIdentifier("id");

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

  tag
    .get("body")
    .unshiftContainer(
      "body",
      t.markoScriptlet([
        t.variableDeclaration("const", [
          t.variableDeclarator(idId, t.callExpression(byId, getByArgs(tag))),
        ]),
      ])
    );

  tag.set("keyScope", idId);
  byAttr.remove();
};

function getByArgs(tag: t.NodePath<t.MarkoTag>) {
  const body = tag.get("body");
  const params = body.node.params;

  // TODO: if any param is not an identifier we need to ensure it is.

  if (getAttr(tag, "in")) {
    if (params.length < 1) {
      body.pushContainer("params", tag.scope.generateUidIdentifier("key"));
    }

    if (params.length < 2) {
      body.pushContainer("params", tag.scope.generateUidIdentifier("val"));
    }
  } else if (getAttr(tag, "of")) {
    if (params.length < 1) {
      body.pushContainer("params", tag.scope.generateUidIdentifier("val"));
    }

    if (params.length < 2) {
      body.pushContainer("params", tag.scope.generateUidIdentifier("key"));
    }
  } else {
    if (params.length < 1) {
      body.pushContainer("params", tag.scope.generateUidIdentifier("index"));
    }
  }

  return params as t.Identifier[];
}
