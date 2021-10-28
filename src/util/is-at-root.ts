import { types as t } from "@marko/compiler";
import isCoreTag from "./is-core-tag";

export default function isAtRoot(tag: t.NodePath<t.MarkoTag>) {
  const parentPath = tag.parentPath.parentPath!;
  // Special case `<get>` since it currently wraps it's children
  // which is an implementation detail.
  return parentPath!.isProgram() || isCoreTag("get", parentPath);
}
