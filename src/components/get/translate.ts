import type { types as t } from "@marko/compiler";
import replaceAssignments from "../../util/replace-assignments/transform";

export default function translate(tag: t.NodePath<t.MarkoTag>) {
  const tagVar = tag.get("var") as t.NodePath<t.LVal>;
  const body = tag.get("body");
  const params = [tagVar.node] as (t.Identifier | t.RestElement | t.Pattern)[];

  if (tagVar.isIdentifier()) {
    const binding = tag.scope.getBinding(tagVar.node.name)!;
    const changeId = tag.scope.generateUidIdentifier(
      `${tagVar.node.name}Change`,
    );

    params.push(changeId);
    replaceAssignments(binding, changeId);
  }

  for (const param of params) {
    body.pushContainer("params", param);
  }

  for (const sibling of tag.getAllNextSiblings()) {
    body.pushContainer("body", sibling.node as any);
    sibling.remove();
  }

  tag.scope.crawl();
  tag.node.var = null;
}
