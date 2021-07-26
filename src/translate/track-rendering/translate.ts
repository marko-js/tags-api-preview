import { types as t } from "@marko/compiler";
import { importNamed } from "@marko/babel-utils";
import isApi from "../../util/is-api";

export default {
  Program: {
    exit(program) {
      const file = program.hub.file;
      const isHTML = file.markoOpts.output === "html";
      if (isHTML || isApi(program, "class")) return;
      const renderBlock = (file as any)
        ._renderBlock as t.NodePath<t.BlockStatement>;
      renderBlock.node.body = [
        t.expressionStatement(
          t.callExpression(importNamed(file, __dirname, "begin"), [])
        ),
        t.tryStatement(
          t.blockStatement(renderBlock.node.body),
          null,
          t.blockStatement([
            t.expressionStatement(
              t.callExpression(importNamed(file, __dirname, "end"), [])
            ),
          ])
        ),
      ];
    },
  },
} as t.Visitor;
