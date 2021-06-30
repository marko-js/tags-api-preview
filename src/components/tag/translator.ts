import { types as t } from "@marko/compiler";

export = function transform(tag: t.NodePath<t.MarkoTag>) {
  const tagVar = tag.node.var! as t.Identifier;
  const body = tag.node.body;
  const errorMessage = tag.node.attributes.length
    ? "does not support attributes"
    : !tagVar
    ? "requires a tag variable"
    : !t.isIdentifier(tagVar)
    ? "cannot have a destructured tag variable"
    : tag.node.arguments
    ? "does not support arguments"
    : !body.body.length
    ? "requires body content"
    : undefined;

  if (errorMessage) {
    throw tag.get("name").buildCodeFrameError(`The <tag> tag ${errorMessage}.`);
  }

  tag.replaceWith(
    t.functionDeclaration(
      tagVar,
      [t.identifier("out"), ...body.params],
      t.blockStatement(body.body)
    )
  );
};
