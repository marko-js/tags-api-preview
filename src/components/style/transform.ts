import path from "path";
import MagicString, { SourceMap } from "magic-string";
import { types as t, Config } from "@marko/compiler";
import { resolveRelativePath, importDefault } from "@marko/babel-utils";
import getAttr from "../../util/get-attr";
import isApi from "../../util/is-api";

const STYLE_REG = /^style((?:\.[^\s\\/:*?"<>|({]+)+)?/;
const styleIndexes = new WeakMap<t.BabelFile, number>();

export = (tag: t.NodePath<t.MarkoTag>) => {
  if (isApi(tag, "class")) return;

  const {
    hub: { file },
    node,
  } = tag;
  const { deps } = file.metadata.marko;
  const filename = file.opts.filename as string;
  const typeValue = getAttr(tag, "class")?.get("value");
  const [, type = ".css"] = STYLE_REG.exec(node.rawValue || "style")!;

  if (typeValue) {
    node.attributes.pop();
  }

  const errorMessage =
    node.attributes.length > 0
      ? "does not support attributes"
      : !node.body.body.length
      ? "requires body content"
      : node.body.params.length
      ? "does not support tag body parameters"
      : node.arguments?.length
      ? "does not support arguments"
      : typeValue &&
        (!typeValue.isStringLiteral() ||
          `.${typeValue.node.value.replace(/ /g, ".")}` !== type)
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

  const styleIndex = styleIndexes.get(file) || 0;
  const base = path.basename(filename);
  const text = node.body.body[0] as t.MarkoText;
  const virtualPath = `./${
    base +
    (styleIndex ? `.${styleIndex}` : "") +
    (node.var ? `.module.${type}` : type)
  }`;
  let code = text.value;
  styleIndexes.set(file, styleIndex + 1);

  if (node.var) {
    const { sourceMaps } = file.opts;
    const { resolveVirtualDependency } = file.markoOpts as unknown as Config;
    let map: SourceMap | undefined;

    if (!resolveVirtualDependency) {
      throw tag.buildCodeFrameError(
        `@marko/tags-api-preview: the "resolveVirtualDependency" option must be supplied when using "style" with a tag variable.`
      );
    }

    if (sourceMaps && text.start != null && text.end != null) {
      map = new MagicString(file.code, { filename })
        .snip(text.start, text.end)
        .generateMap({
          source: filename,
          includeContent: true,
        });

      if (sourceMaps === "inline" || sourceMaps === "both") {
        code += `\n/*# sourceMappingURL=${map.toUrl()}*/`;

        if (sourceMaps === "inline") {
          map = undefined;
        }
      }
    }

    const resolved = resolveRelativePath(
      file,
      resolveVirtualDependency(filename, {
        virtualPath,
        map,
        code,
      })
    );

    deps.push(resolved);
    tag.replaceWith(
      t.markoScriptlet([
        t.variableDeclaration("const", [
          t.variableDeclarator(
            node.var,
            importDefault(file, resolved, "style")
          ),
        ]),
      ])
    );
  } else {
    const dep = {
      type: type.slice(1),
      style: true,
      code,
      startPos: text.start,
      endPos: text.end,
      path: `./${base}`,
      virtualPath,
    } as const;
    deps.push(dep);
    tag.remove();
  }
};
