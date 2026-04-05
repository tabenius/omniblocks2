import type { SerializedNode, SerializedNodes } from "@craftjs/core";
import { isRecord } from "./typeGuards";

// Blocks that render a single prop as positional text (rest-of-line)
const POSITIONAL_PROP: Record<string, string> = {
  Heading: "text",
  Paragraph: "text",
  AlterParagraph: "text",
  Image: "src", // ImageBlock uses displayName "Image"
  Audio: "src",
  Video: "src",
  Diagram: "source",
  Event: "title",
  Author: "name",
  Button: "text",
  Name: "label",
  Email: "label",
  Textarea: "label",
};

type NodeProps = Record<string, unknown>;
const DEFAULT_BLOCK_NAME = "Block";
const ROOT_NODE_ID = "ROOT";
const MAX_SERIALIZE_DEPTH = 64;
const SKIPPED_PROP_KEYS = new Set(["children"]);

function readNodeProps(node: SerializedNode): NodeProps {
  return isRecord(node.props) ? node.props : {};
}

function getDisplayName(node: SerializedNode): string {
  if (typeof node.displayName === "string" && node.displayName.trim() !== "") {
    return node.displayName;
  }
  if (typeof node.type === "string" && node.type.trim() !== "") return node.type;
  if (isRecord(node.type) && typeof node.type.resolvedName === "string" && node.type.resolvedName.trim() !== "") {
    return node.type.resolvedName;
  }
  return DEFAULT_BLOCK_NAME;
}

function getChildIds(node: SerializedNode): string[] {
  const linked = isRecord(node.linkedNodes) ? Object.values(node.linkedNodes) : [];
  const regular = Array.isArray(node.nodes) ? node.nodes : [];
  const merged = [...linked, ...regular];
  return merged.filter((id): id is string => typeof id === "string" && id.trim() !== "");
}

function quoteValue(raw: string): string {
  return `"${raw.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

// Convert Craft.js displayName + props → block language name
function blockName(displayName: string, props: NodeProps): string {
  if (displayName === "Heading") {
    const rawLevel = props.level;
    const parsedLevel =
      typeof rawLevel === "number"
        ? rawLevel
        : typeof rawLevel === "string"
          ? Number(rawLevel)
          : Number.NaN;
    const level = Number.isFinite(parsedLevel)
      ? Math.min(6, Math.max(1, Math.trunc(parsedLevel)))
      : 1;
    return `H${level}`;
  }
  return displayName;
}

// Format the prop portion of a line (positional or key=value)
function formatProps(displayName: string, props: NodeProps): string {
  const positional = POSITIONAL_PROP[displayName];
  if (positional != null && props[positional] != null) {
    const value = props[positional];
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
  }

  const parts: string[] = [];
  for (const [k, v] of Object.entries(props)) {
    if (SKIPPED_PROP_KEYS.has(k) || v == null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    let str: string;
    if (typeof v === "string") {
      str = v;
    } else if (typeof v === "number" || typeof v === "boolean") {
      str = String(v);
    } else {
      try {
        str = JSON.stringify(v);
      } catch {
        str = String(v);
      }
    }
    const needsQuotes = /[\s="']/.test(str);
    parts.push(`${k}=${needsQuotes ? quoteValue(str) : str}`);
  }
  return parts.join(" ");
}

function serializeNode(
  nodes: SerializedNodes,
  id: string,
  depth: number,
  skipSelf: boolean,
  path: Set<string>
): string {
  if (depth > MAX_SERIALIZE_DEPTH || path.has(id)) return "";
  const node = nodes[id];
  if (!node) return "";

  path.add(id);
  const childIds = getChildIds(node);

  if (skipSelf) {
    const result = childIds
      .map((cid) => serializeNode(nodes, cid, depth, false, path))
      .filter(Boolean)
      .join("\n");
    path.delete(id);
    return result;
  }

  const displayName = getDisplayName(node);
  const props = readNodeProps(node);
  const name = blockName(displayName, props);
  const propStr = formatProps(displayName, props);
  const indent = "  ".repeat(depth);
  const line = `${indent}${name}${propStr ? " " + propStr : ""}`;

  if (childIds.length === 0) {
    path.delete(id);
    return line;
  }

  const childLines = childIds
    .map((cid) => serializeNode(nodes, cid, depth + 1, false, path))
    .filter(Boolean)
    .join("\n");

  path.delete(id);
  return childLines ? `${line}\n${childLines}` : line;
}

/**
 * Serialize Craft.js serialized nodes to the OmniBlocks block language.
 * ROOT is skipped; its children are emitted at depth 0.
 */
export function serializeToBlockLanguage(nodes: SerializedNodes): string {
  if (!isRecord(nodes)) return "";
  return serializeNode(nodes, ROOT_NODE_ID, 0, true, new Set<string>());
}
