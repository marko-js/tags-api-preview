import path from "path";
export const taglibId =
  process.env.NODE_ENV === "production"
    ? "@marko/tags-api-preview"
    : path.join(__dirname, "../components");
