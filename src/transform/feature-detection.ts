import { getTagDef, isDynamicTag } from "@marko/babel-utils";
import { types as t } from "@marko/compiler";
import { taglibId } from "../util/taglib-id";
import { buildAggregateError } from "../util/build-aggregate-error";

type Feature = {
  name: string;
  path: t.NodePath;
  type: "tags" | "class";
};
type FeatureState = {
  feature?: Feature;
};

const featureDetectionVisitor = {
  MarkoComment(comment, state) {
    if (/^\s*use tags\s*$/.test(comment.node.value)) {
      addFeature(state, "tags", "<!-- use tags -->", comment);
    }
  },
  MarkoScriptlet(scriptlet, state) {
    if (!scriptlet.node.static) {
      addFeature(state, "class", "Scriptlet", scriptlet);
    }
  },
  MarkoClass(markoClass, state) {
    addFeature(state, "class", "Class block", markoClass.get("body"));
  },
  ReferencedIdentifier(ref: t.NodePath<t.Identifier>, state: FeatureState) {
    const name = ref.node.name;

    if (
      (name === "input" || name === "component" || name === "out") &&
      !ref.scope.hasBinding(name)
    ) {
      addFeature(state, "class", `${name} template global`, ref);
    }
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
        } else if (attr.node.bound) {
          addFeature(state, "tags", "Bound attribute", attr);
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
            case "body":
            case "head":
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
    } else if (isDynamicTag(tag) && tag.node.arguments?.length) {
      addFeature(state, "class", "Dynamic tag arguments", tag);
    }
  },
} as t.Visitor<FeatureState>;

export default {
  Program(program) {
    const state: FeatureState = {};
    program.node.extra ??= {};
    program.traverse(featureDetectionVisitor, state);
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
