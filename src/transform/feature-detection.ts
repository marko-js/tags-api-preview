import { getTagDef } from "@marko/babel-utils";
import { types as t } from "@marko/compiler";
import { taglibId } from "../../marko.json";
import { buildAggregateError } from "../util/build-aggregate-error";

type Feature = {
  name: string;
  path: t.NodePath;
  type: "tags" | "class";
};
type FeatureState = {
  feature?: Feature;
};

// TODO: renderBody default attr

const featureDetectionVisitor = {
  MarkoScriptlet(scriptlet, state) {
    addFeature(state, "class", "Scriptlet", scriptlet);
  },
  MarkoClass(markoClass, state) {
    addFeature(state, "class", "Class block", markoClass.get("body"));
  },
  MarkoTag(tag, state) {
    if (tag.node.var) {
      addFeature(
        state,
        "tags",
        "Tag variable",
        tag.get("var") as t.NodePath<t.LVal>
      );
    }

    for (const attr of tag.get("attributes")) {
      if (attr.isMarkoAttribute()) {
        if (attr.node.arguments?.length) {
          addFeature(
            state,
            "class",
            "Attribute arguments",
            attr.get("arguments")[0]
          );
          break;
        } else if (attr.node.modifier) {
          addFeature(state, "class", "Attribute modifier", attr);
          break;
        }
      }
    }

    const tagDef = getTagDef(tag);

    if (tagDef) {
      switch (tagDef.taglibId) {
        case "marko-html":
        case "marko-math":
        case "marko-svg": {
          for (const attr of tag.get("attributes")) {
            if (attr.isMarkoAttribute()) {
              switch (attr.node.name) {
                case "key":
                case "no-update":
                case "no-update-if":
                case "no-update-body-if":
                  addFeature(
                    state,
                    "class",
                    `"${attr.node.name}" attribute`,
                    attr
                  );
                  break;
              }
            }
          }
          break;
        }
        case "marko-default-core":
          switch (tagDef.name) {
            case "if":
            case "for":
            case "else":
            case "else-if":
            case "import":
            case "style":
            case "html-comment":
              break;
            default:
              addFeature(
                state,
                "class",
                `<${tagDef.name}> tag`,
                tag.get("name")
              );
              break;
          }
          break;
        case taglibId:
          switch (tagDef.name) {
            case "if":
            case "else-if":
            case "for":
            case "style":
              break;
            default:
              addFeature(
                state,
                "tags",
                `<${tagDef.name}> tag`,
                tag.get("name")
              );
          }
          break;
      }
    }
  },
} as t.Visitor<FeatureState>;

export default {
  Program(program) {
    const state: FeatureState = {};
    program.traverse(featureDetectionVisitor, state);
    program.node.extra ??= {};
    program.node.extra.___featureType = state.feature?.type || "class";
  },
} as t.Visitor;

function addFeature(
  state: FeatureState,
  type: Feature["type"],
  name: Feature["name"],
  path: Feature["path"]
) {
  if (state.feature) {
    if (state.feature.type !== type) {
      throw buildAggregateError(
        path.hub.file,
        'Cannot mix "tags api" and "class api" features',
        [state.feature.name, state.feature.path],
        [name, path]
      );
    }
  } else {
    state.feature = {
      name,
      path,
      type,
    };
  }
}
