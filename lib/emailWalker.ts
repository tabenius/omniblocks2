import * as React from "react";
import type { SerializedNodes, SerializedNode } from "@craftjs/core";
import { emailResolver } from "@/components/renderers/email";

const CSS_VAR_RE = /var\(--([^)]+)\)/g;

function resolveVarValue(value: string, vars: Record<string, string>): string {
  return value.replace(CSS_VAR_RE, (match, name: string) => vars[`--${name}`] ?? match);
}

function resolveProps(
  props: Record<string, unknown>,
  vars: Record<string, string>,
): Record<string, unknown> {
  const result = { ...props };
  for (const [key, val] of Object.entries(result)) {
    if (typeof val === "string" && val.includes("var(")) {
      result[key] = resolveVarValue(val, vars);
    }
  }
  return result;
}

/**
 * Walk Craft.js serialized JSON → React element tree using the email resolver.
 * Never touches the editor DOM. The JSON is the single source of truth.
 *
 * LinkedNodes (used by LayoutBlock columns) are flattened into the children
 * stream in insertion order, so each column becomes one child.
 *
 * If themeVars is provided, any `var(--color-X)` values in props are resolved
 * to their actual values. Email clients don't support CSS custom properties.
 */
export function walkEmail(
  nodes: SerializedNodes,
  id: string = "ROOT",
  themeVars?: Record<string, string>,
): React.ReactElement | null {
  const node: SerializedNode | undefined = nodes[id];
  if (!node) return null;

  const name = node.displayName || (node.type as { resolvedName?: string })?.resolvedName || "";
  const Component = emailResolver[name];

  // Flatten linkedNodes → then children nodes
  const linkedIds = node.linkedNodes ? Object.values(node.linkedNodes) : [];
  const childIds = [...linkedIds, ...(node.nodes ?? [])];
  const children = childIds
    .map((cid) => walkEmail(nodes, cid, themeVars))
    .filter(Boolean) as React.ReactElement[];

  // Unknown block: transparently pass children through
  if (!Component) {
    return React.createElement(React.Fragment, { key: id }, ...children);
  }

  const props = themeVars && node.props
    ? resolveProps(node.props as Record<string, unknown>, themeVars)
    : node.props;

  return React.createElement(
    Component,
    { key: id, ...props },
    children.length > 0 ? children : undefined
  );
}
