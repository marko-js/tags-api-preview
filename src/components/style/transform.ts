import path from "path";
import { types as t } from "@marko/compiler";
import { MarkoText } from "@marko/compiler/babel-types";
import getAttr from "../../util/get-attr";
import isApi from "../../util/is-api";

const STYLE_REG = /^style(?:\.([a-zA-Z0-9$_-]+(?:\.[a-zA-Z0-9$_-]+)*))?/;

export = (tag: t.NodePath<t.MarkoTag>) => {
  if (isApi(tag, "class")) return;

  const { hub, node } = tag;
  const { deps } = hub.file.metadata.marko;
  const typeValue = getAttr(tag, "class")?.get("value");
  const [, type = "css"] = STYLE_REG.exec(node.rawValue || "style")!;

  if (typeValue) {
    node.attributes.pop();
  }

  const errorMessage = node.var
    ? "does not support a tag variable"
    : node.attributes.length > 0
    ? "does not support attributes"
    : !node.body.body.length
    ? "requires body content"
    : node.body.params.length
    ? "does not support tag body parameters"
    : node.arguments?.length
    ? "does not support arguments"
    : typeValue &&
      (!typeValue.isStringLiteral() ||
        typeValue.node.value.replace(/ /g, ".") !== type)
    ? "invalid class attribute"
    : undefined;

  if (errorMessage) {
    throw tag
      .get("name")
      .buildCodeFrameError(`The <style> tag ${errorMessage}.`);
  }

  if (node.body.body.length > 1) {
    for (const child of tag.get("body").get("body")) {
      if (!child.isMarkoText()) {
        throw child.buildCodeFrameError(
          "The <style> tag does not support dynamic placeholders."
        );
      }
    }
  }

  const styleIndex = deps.findIndex((dep) => (dep as any).style);
  const base = path.basename(hub.file.opts.sourceFileName as string);
  const text = node.body.body[0] as MarkoText;

  deps.push({
    type,
    style: true,
    code: text.value,
    startPos: text.start,
    endPos: text.end,
    path: `./${base}`,
    virtualPath: `./${
      base + (styleIndex === -1 ? "" : `.${styleIndex + 1}`)
    }.${type}`,
  } as any);

  tag.remove();
};
