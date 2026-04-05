import type { SerializedNodes } from "@craftjs/core";

// Blocks that render a single prop as positional text (rest-of-line)
const POSITIONAL_PROP: Record<string, string> = {
  Heading: "text",
  Paragraph: "text",
  AlterParagraph: "text",
  Image: "src", // ImageBlock uses displayName "Image"
  Audio: "src",
  Diagram: "code",
  Author: "name",
};

// Convert Craft.js displayName + props → block language name
function blockName(displayName: string, props: Record<string, any>): string {
  if (displayName === "Heading") return `H${props.level ?? 1}`;
  return displayName;
}

// Format the prop portion of a line (positional or key=value)
function formatProps(displayName: string, props: Record<string, any>): string {
  const positional = POSITIONAL_PROP[displayName];
  if (positional != null && props[positional] != null) {
    return String(props[positional]);
  }

  const skip = new Set(["children"]);
  const parts: string[] = [];
  for (const [k, v] of Object.entries(props)) {
    if (skip.has(k) || v == null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    const str = String(v);
    const needsQuotes = /[ ="']/.test(str);
    parts.push(`${k}=${needsQuotes ? `"${str.replace(/"/g, '\\"')}"` : str}`);
  }
  return parts.join(" ");
}

function serializeNode(
  nodes: SerializedNodes,
  id: string,
  depth: number,
  skipSelf: boolean
): string {
  const node = nodes[id];
  if (!node) return "";

  // linkedNodes first (column-0, column-1…) then regular children
  const childIds = [
    ...(node.linkedNodes ? Object.values(node.linkedNodes) : []),
    ...(node.nodes ?? []),
  ];

  if (skipSelf) {
    return childIds
      .map((cid) => serializeNode(nodes, cid, depth, false))
      .filter(Boolean)
      .join("\n");
  }

  const displayName =
    node.displayName ||
    (typeof node.type === "object"
      ? (node.type as { resolvedName: string }).resolvedName
      : String(node.type)) ||
    "Block";

  const props = (node.props as Record<string, any>) ?? {};
  const name = blockName(displayName, props);
  const propStr = formatProps(displayName, props);
  const indent = "  ".repeat(depth);
  const line = `${indent}${name}${propStr ? " " + propStr : ""}`;

  if (childIds.length === 0) return line;

  const childLines = childIds
    .map((cid) => serializeNode(nodes, cid, depth + 1, false))
    .filter(Boolean)
    .join("\n");

  return childLines ? `${line}\n${childLines}` : line;
}

/**
 * Serialize Craft.js serialized nodes to the OmniBlocks block language.
 * ROOT is skipped; its children are emitted at depth 0.
 */
export function serializeToBlockLanguage(nodes: SerializedNodes): string {
  return serializeNode(nodes, "ROOT", 0, true);
}
