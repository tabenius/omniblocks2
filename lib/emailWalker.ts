import * as React from "react";
import type { SerializedNodes, SerializedNode } from "@craftjs/core";
import { emailResolver } from "@/components/renderers/email";

/**
 * Walk Craft.js serialized JSON → React element tree using the email resolver.
 * Never touches the editor DOM. The JSON is the single source of truth.
 *
 * LinkedNodes (used by LayoutBlock columns) are flattened into the children
 * stream in insertion order, so each column becomes one child.
 */
export function walkEmail(
  nodes: SerializedNodes,
  id: string = "ROOT"
): React.ReactElement | null {
  const node: SerializedNode | undefined = nodes[id];
  if (!node) return null;

  const name = node.displayName || (node.type as { resolvedName?: string })?.resolvedName || "";
  const Component = emailResolver[name];

  // Flatten linkedNodes → then children nodes
  const linkedIds = node.linkedNodes ? Object.values(node.linkedNodes) : [];
  const childIds = [...linkedIds, ...(node.nodes ?? [])];
  const children = childIds
    .map((cid) => walkEmail(nodes, cid))
    .filter(Boolean) as React.ReactElement[];

  // Unknown block: transparently pass children through
  if (!Component) {
    return React.createElement(React.Fragment, { key: id }, ...children);
  }

  return React.createElement(
    Component,
    { key: id, ...node.props },
    children.length > 0 ? children : undefined
  );
}
