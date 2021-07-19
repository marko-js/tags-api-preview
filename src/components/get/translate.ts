import { types as t } from "@marko/compiler";
import replaceAssignments from "../../util/replace-assignments";

export = function translate(tag: t.NodePath<t.MarkoTag>) {
  const tagVar = tag.get("var") as t.NodePath<t.LVal>;
  const body = tag.get("body");
  const params: t.LVal[] = [tagVar.node];

  if (tagVar.isIdentifier()) {
    const binding = tag.scope.getBinding(tagVar.node.name)!;
    const changeId = tag.scope.generateUidIdentifier(
      `${tagVar.node.name}Change`
    );

    params.push(changeId);
    replaceAssignments(binding, (value) => t.callExpression(changeId, [value]));
  }

  for (const param of params) {
    body.pushContainer("params", param);
  }

  for (const sibling of tag.getAllNextSiblings()) {
    body.pushContainer("body", sibling.node);
    sibling.remove();
  }

  tag.node.var = null;
};
