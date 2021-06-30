import { types as t } from "@marko/compiler";

export = function translate(tag: t.NodePath<t.MarkoTag>) {
  const body = tag.get("body");
  body.pushContainer("params", tag.node.var!);
  tag.node.var = null;

  for (const sibling of tag.getAllNextSiblings()) {
    body.pushContainer("body", sibling.node);
    sibling.remove();
  }
};
