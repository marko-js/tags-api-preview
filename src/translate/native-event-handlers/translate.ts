import { types as t } from "@marko/compiler";
import { isNativeTag, importDefault } from "@marko/babel-utils";
import isApi from "../../util/is-api";
const eventNameReg = /^on[A-Z]/;

export default {
  MarkoTag(tag: t.NodePath<t.MarkoTag>) {
    if (isApi(tag, "tags") && isNativeTag(tag)) {
      const file = tag.hub.file;
      const isHTML = file.markoOpts.output === "html";
      let spreadEventHandlersId: t.Identifier | null = null;
      for (const attr of tag.get("attributes")) {
        if (attr.isMarkoAttribute()) {
          const { node } = attr;

          if (eventNameReg.test(node.name) && node.value) {
            if (isHTML) {
              attr.remove();
            } else {
              node.arguments = [node.value];
              node.value = t.booleanLiteral(true);
            }
          }
        } else {
          if (!spreadEventHandlersId && !isHTML) {
            spreadEventHandlersId = tag.scope.generateUidIdentifier("handlers");
            tag.insertBefore(
              t.variableDeclaration("var", [
                t.variableDeclarator(
                  spreadEventHandlersId,
                  t.objectExpression([])
                ),
              ])
            );

            const extra = (tag.node.extra || (tag.node.extra = {})) as {
              properties?: t.ObjectExpression["properties"];
            };

            const props = extra.properties || (extra.properties = []);
            props.push(t.spreadElement(spreadEventHandlersId));
          }
          attr.set(
            "value",
            t.callExpression(
              importDefault(file, __dirname, "extractHandlers"),
              [
                (file as any)._componentDefIdentifier,
                spreadEventHandlersId,
                attr.node.value,
              ]
            )
          );
        }
      }
    }
  },
} as t.Visitor;
