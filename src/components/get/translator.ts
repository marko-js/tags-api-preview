import path from "path";
import { types as t } from "@marko/compiler";
import utils from "@marko/babel-utils";
import getAttr from "../../util/get-attr";

export = function translate(tag: t.NodePath<t.MarkoTag>) {
  const body = tag.get("body");
  body.pushContainer("params", tag.node.var!);
  tag.node.var = null;

  for (const sibling of tag.getAllNextSiblings()) {
    body.pushContainer("body", sibling.node);
    sibling.remove();
  }
};
