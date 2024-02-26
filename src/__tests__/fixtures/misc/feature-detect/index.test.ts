import fixture from "../../../fixture";

describe("misc feature detect", () => {
  describe(
    "class by default",
    fixture("./templates/feature-detect-class-by-default.marko"),
  );

  describe(
    "tags comment directive",
    fixture("./templates/feature-detect-tags-comment-directive.marko"),
  );

  describe("tags var", fixture("./templates/feature-detect-tags-var.marko"));

  describe(
    "tags new tag",
    fixture("./templates/feature-detect-tags-new-tag.marko"),
  );

  describe(
    "error arg events",
    fixture("./templates/error-feature-detect-arg-events.marko"),
  );

  describe(
    "error attr modifier",
    fixture("./templates/error-feature-detect-attr-modifier.marko"),
  );

  describe(
    "error class block",
    fixture("./templates/error-feature-detect-class-block.marko"),
  );

  describe(
    "error legacy attrs",
    fixture("./templates/error-feature-detect-legacy-attrs.marko"),
  );

  describe(
    "error legacy tag",
    fixture("./templates/error-feature-detect-legacy-tag.marko"),
  );

  describe(
    "error reference component",
    fixture("./templates/error-feature-detect-reference-component.marko"),
  );

  describe(
    "error reference out",
    fixture("./templates/error-feature-detect-reference-out.marko"),
  );

  describe(
    "error scriptlet",
    fixture("./templates/error-feature-detect-scriptlet.marko"),
  );
});
