import type { types as t } from "@marko/compiler";
export default function getAttr(tag: t.NodePath<t.MarkoTag>, name: string) {
  return tag
    .get("attributes")
    .find((attr): attr is t.NodePath<t.MarkoAttribute> => {
      return (attr.node as t.MarkoAttribute).name === name;
    });
}
