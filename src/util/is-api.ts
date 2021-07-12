import { types as t } from "@marko/compiler";
export default function isApi(path: t.NodePath<any>, type: "class" | "tags") {
  return path.hub.file.path.node.extra!.___featureType === type;
}
