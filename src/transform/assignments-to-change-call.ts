import { types as t } from "@marko/compiler";
import replaceAssignments from "../util/replace-assignments";

export default {
  MarkoTag: {
    exit(tag: t.NodePath<t.MarkoTag>) {
      const tagVar = tag.get("var");
      if (!tagVar.node || tagVar.isIdentifier()) {
        return;
      }

      forEachBindingIdentifier(
        tagVar as t.NodePath<t.PatternLike>,
        updateAssignmentsForIdentifier
      );
    },
  },
} as t.Visitor;

function updateAssignmentsForIdentifier(identifier: t.NodePath<t.Identifier>) {
  const binding = identifier.scope.getBinding(identifier.node.name)!;
  const assignments = binding.constantViolations;
  if (!assignments.length) return;

  let changeKey: t.Expression;
  let parent = identifier.parentPath as t.NodePath<
    t.PatternLike | t.ObjectProperty
  >;

  if (parent.isRestElement()) {
    throw assignments[0].buildCodeFrameError(
      "Cannot assign to a ...rest element."
    );
  }

  if (parent.isAssignmentPattern()) {
    parent = parent.parentPath as t.NodePath<t.PatternLike>;
  }

  if (parent.isArrayPattern()) {
    throw assignments[0].buildCodeFrameError(
      "Assignment to a destructured array will come in a future version of the tags api preview."
    );
  }

  if (parent.isObjectProperty()) {
    const pattern = parent.parentPath as t.NodePath<t.ObjectPattern>;
    const key = parent.get("key");

    if (parent.node.computed) {
      changeKey = identifier.scope.generateUidIdentifier(
        `${identifier.node.name}Change`
      );
      pattern.pushContainer(
        "properties",
        t.objectProperty(
          t.binaryExpression("+", key.node, t.stringLiteral("Change")),
          changeKey,
          true
        )
      );
    } else if (key.isStringLiteral()) {
      const searchKey = `${key.node.value}Change`;
      for (const prop of pattern.get("properties")) {
        if (prop.isObjectProperty()) {
          const propKey = prop.get("key");
          const propValue = prop.get("value");
          if (
            propKey.isStringLiteral() &&
            propKey.node.value === searchKey &&
            propValue.isIdentifier()
          ) {
            changeKey = propValue.node;
            break;
          }
        }
      }

      if (!changeKey!) {
        pattern.pushContainer(
          "properties",
          t.objectProperty(
            t.stringLiteral(searchKey),
            (changeKey = identifier.scope.generateUidIdentifier(searchKey))
          )
        );
      }
    } else if (key.isIdentifier()) {
      const searchKey = `${key.node.name}Change`;
      for (const prop of pattern.get("properties")) {
        if (prop.isObjectProperty()) {
          const propKey = prop.get("key");
          const propValue = prop.get("value");
          if (
            propKey.isIdentifier() &&
            propKey.node.name === searchKey &&
            propValue.isIdentifier()
          ) {
            changeKey = propValue.node;
            break;
          }
        }
      }

      if (!changeKey!) {
        pattern.pushContainer(
          "properties",
          t.objectProperty(
            t.identifier(searchKey),
            (changeKey = identifier.scope.generateUidIdentifier(searchKey))
          )
        );
      }
    }
  }

  replaceAssignments(binding, (value) => t.callExpression(changeKey, [value]));
}

function forEachBindingIdentifier(
  path: t.NodePath<t.PatternLike>,
  fn: (identifier: t.NodePath<t.Identifier>) => void
): void {
  switch (path.node.type) {
    case "ObjectPattern":
      for (const prop of (path as t.NodePath<t.ObjectPattern>).get(
        "properties"
      )) {
        forEachBindingIdentifier(
          prop.isObjectProperty()
            ? (prop.get("value") as t.NodePath<t.PatternLike>)
            : (prop as t.NodePath<t.RestElement>),
          fn
        );
      }
      break;
    case "ArrayPattern":
      for (const el of (path as t.NodePath<t.ArrayPattern>).get("elements")) {
        forEachBindingIdentifier(el as t.NodePath<t.PatternLike>, fn);
      }
      break;
    case "RestElement":
      forEachBindingIdentifier(
        (path as t.NodePath<t.RestElement>).get(
          "argument"
        ) as t.NodePath<t.PatternLike>,
        fn
      );
      break;
    case "AssignmentPattern":
      forEachBindingIdentifier(
        (path as t.NodePath<t.AssignmentPattern>).get(
          "left"
        ) as t.NodePath<t.PatternLike>,
        fn
      );
      break;
    case "Identifier":
      fn(path as t.NodePath<t.Identifier>);
      break;
  }
}
