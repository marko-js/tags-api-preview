import type { types as t } from "@marko/compiler";
import getAttr from "../../util/get-attr";
import isApi from "../../util/is-api";

const seen = new WeakSet<t.NodePath<t.MarkoTag>>();

export default function transform(tag: t.NodePath<t.MarkoTag>) {
  if (isApi(tag, "class") || seen.has(tag)) return;
  seen.add(tag);

  const valueAttr = getAttr(tag, "value")!;
  const errorMessage = tag.node.var
    ? "does not support a tag variable"
    : tag.node.arguments?.length
      ? "does not support arguments, the tags api uses '<if=condition>' instead"
      : !valueAttr
        ? "must be given a value"
        : tag.node.attributes.length > 1
          ? "only supports the 'value' attribute"
          : !tag.node.body.body.length
            ? "requires body content"
            : tag.node.body.params.length
              ? "does not support tag body parameters"
              : undefined;

  if (errorMessage) {
    throw tag
      .get("name")
      .buildCodeFrameError(
        `The <${(tag.node.name as t.StringLiteral).value}> tag ${errorMessage}.`,
      );
  }

  tag.node.arguments = [valueAttr.node.value];
  tag.node.attributes = [];
}
