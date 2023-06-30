import { types as t } from "@marko/compiler";
import assertNoAssignments from "../../util/assert-no-assignments";
const IDENTIFIERS = new WeakMap<t.NodePath<t.MarkoTag>, t.Identifier>();

export default {
  enter(tag: t.NodePath<t.MarkoTag>) {
    const tagVar = tag.node.var! as t.Identifier;
    const body = tag.node.body;
    const errorMessage = tag.node.arguments
      ? "does not support arguments"
      : tag.node.attributes.length
      ? "does not support attributes"
      : !tagVar
      ? "requires a tag variable"
      : !t.isIdentifier(tagVar)
      ? "cannot have a destructured tag variable"
      : !body.body.length
      ? "requires body content"
      : undefined;

    if (errorMessage) {
      throw tag
        .get("name")
        .buildCodeFrameError(`The <tag> tag ${errorMessage}.`);
    }

    assertNoAssignments(tag.get("var") as t.NodePath<t.PatternLike>);

    // We must clear the var to avoid the default translator complaining
    // but we store it in a weakmap so we can read on exit.
    IDENTIFIERS.set(tag, tagVar);
    tag.node.var = null;
  },
  exit(tag: t.NodePath<t.MarkoTag>) {
    tag.replaceWith(
      t.functionDeclaration(
        IDENTIFIERS.get(tag)!,
        [t.identifier("out"), ...tag.node.body.params],
        t.blockStatement(tag.node.body.body)
      )
    );
  },
};
