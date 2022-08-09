import { types as t } from "@marko/compiler";
import { isNativeTag } from "@marko/babel-utils";
import { importRuntimeDefault } from "../../util/import-runtime";
import isApi from "../../util/is-api";
import getAttr from "../../util/get-attr";
const eventNameReg = /^on[A-Z]/;
const changeNameReg = /Change$/;
const bindsByTag: Record<string, undefined | string[]> = {
  input: ["value", "checked"],
  textarea: ["value"],
};

export default {
  MarkoTag(tag: t.NodePath<t.MarkoTag>) {
    if (isApi(tag, "tags") && isNativeTag(tag)) {
      const file = tag.hub.file;
      const isHTML = file.markoOpts.output === "html";
      const extra = (tag.node.extra || (tag.node.extra = {})) as {
        properties?: t.ObjectExpression["properties"];
      };
      const meta = extra.properties || (extra.properties = []);
      const attrs = tag.get("attributes");

      if (attrs.some((it) => it.isMarkoSpreadAttribute())) {
        const metaId = tag.scope.generateUidIdentifier("meta");
        const properties: t.ObjectExpression["properties"] = [];
        tag.insertBefore(
          t.variableDeclaration("var", [
            t.variableDeclarator(metaId, t.objectExpression([])),
          ])
        );

        meta.push(t.spreadElement(metaId));

        for (const attr of attrs) {
          if (attr.isMarkoAttribute()) {
            if (attr.node.name === "key") continue;

            properties.push(
              t.objectProperty(t.stringLiteral(attr.node.name), attr.node.value)
            );
          } else {
            properties.push(t.spreadElement(attr.node.value));
          }

          attr.remove();
        }

        tag.pushContainer(
          "attributes",
          t.markoSpreadAttribute(
            t.callExpression(
              importRuntimeDefault(
                file,
                "translate/native-tag-handlers",
                "extractHandlers"
              ),
              isHTML
                ? [t.objectExpression(properties)]
                : [
                    t.objectExpression(properties),
                    (file as any)._componentDefIdentifier,
                    tag.node.name as t.StringLiteral,
                    metaId,
                  ]
            )
          )
        );
      } else {
        const tagName = (tag.node.name as t.StringLiteral).value;
        const binds = bindsByTag[tagName];

        for (const attr of attrs as t.NodePath<t.MarkoAttribute>[]) {
          const { node } = attr;
          const { name, value } = node;

          if (isHTML) {
            if (eventNameReg.test(name) || changeNameReg.test(name)) {
              attr.remove();
            }
          } else if (eventNameReg.test(name) && value) {
            node.arguments = [value];
            node.value = t.booleanLiteral(true);
          }
        }

        if (binds) {
          const preserve: t.Expression[] = [];
          for (const name of binds) {
            const changeName = `${name}Change`;
            const valueAttr = getAttr(tag, name);
            const changeAttr = getAttr(tag, changeName);
            const nameLiteral = t.stringLiteral(name);

            if (changeAttr) {
              const eId = t.identifier("e");
              const targetId = t.identifier("target");
              const changeId = tag.scope.generateUidIdentifier(changeName);
              const changeValue = changeAttr.node.value;
              tag.insertBefore(
                t.variableDeclaration("var", [
                  t.variableDeclarator(changeId, changeValue),
                ])
              );

              tag.pushContainer(
                "attributes",
                t.markoAttribute("onInput", t.booleanLiteral(true), null, [
                  t.arrowFunctionExpression(
                    [eId],
                    t.blockStatement([
                      t.expressionStatement(
                        t.callExpression(changeId, [
                          t.memberExpression(
                            t.memberExpression(eId, targetId),
                            t.identifier(name)
                          ),
                        ])
                      ),
                    ])
                  ),
                ])
              );

              changeAttr.remove();

              if (!isHTML && valueAttr && !t.isFunction(changeValue)) {
                preserve.push(t.logicalExpression("&&", changeId, nameLiteral));
              }
            } else if (!isHTML && valueAttr) {
              preserve.push(nameLiteral);
            }
          }

          if (preserve.length) {
            meta.push(
              t.objectProperty(t.identifier("pa"), t.arrayExpression(preserve))
            );
          }
        }
      }
    }
  },
} as t.Visitor;
