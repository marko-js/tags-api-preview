import { types as t } from "@marko/compiler";
import { getTagDef } from "@marko/babel-utils";
import { taglibId } from "../../marko.json";
export default function isCoreTag(
  name: string,
  tag: t.NodePath
): tag is t.NodePath<t.MarkoTag> {
  if (tag.isMarkoTag()) {
    const def = getTagDef(tag);

    if (def && def.name === name && def.taglibId === taglibId) {
      return true;
    }
  }

  return false;
}
