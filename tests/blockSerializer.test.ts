import test from "node:test";
import assert from "node:assert/strict";
import type { SerializedNodes } from "@craftjs/core";
import { serializeToBlockLanguage } from "../lib/blockSerializer";

function asNodes(input: unknown): SerializedNodes {
  return input as SerializedNodes;
}

test("serializes basic heading and paragraph nodes", () => {
  const nodes = asNodes({
    ROOT: { nodes: ["h1", "p"], linkedNodes: {}, props: {}, type: "div" },
    h1: { nodes: [], linkedNodes: {}, props: { level: 2, text: "Welcome" }, displayName: "Heading", type: "Heading" },
    p: { nodes: [], linkedNodes: {}, props: { text: "Start building." }, displayName: "Paragraph", type: "Paragraph" },
  });

  const out = serializeToBlockLanguage(nodes);
  assert.equal(out, "H2 Welcome\nParagraph Start building.");
});

test("serializes key/value props and escapes complex values", () => {
  const nodes = asNodes({
    ROOT: { nodes: ["c1"], linkedNodes: {}, props: {}, type: "div" },
    c1: {
      nodes: [],
      linkedNodes: {},
      props: { padding: "24px", background: "#ffffff", meta: { variant: "hero" } },
      displayName: "Container",
      type: "Container",
    },
  });

  const out = serializeToBlockLanguage(nodes);
  assert.equal(
    out,
    'Container padding=24px background=#ffffff meta="{\\"variant\\":\\"hero\\"}"',
  );
});

test("handles malformed trees defensively", () => {
  const nodes = asNodes({
    ROOT: { nodes: ["a", 123, "", "missing"], linkedNodes: { slot1: "b", slot2: null }, props: {}, type: "div" },
    a: { nodes: ["a", "p"], linkedNodes: {}, props: { className: "card" }, displayName: "Container", type: "Container" },
    b: { nodes: [], linkedNodes: {}, props: { level: "3", text: "Title" }, displayName: "Heading", type: "Heading" },
    p: { nodes: [], linkedNodes: {}, props: { text: "Loop safe" }, displayName: "Paragraph", type: "Paragraph" },
  });

  const out = serializeToBlockLanguage(nodes);
  assert.equal(out, "H3 Title\nContainer className=card\n  Paragraph Loop safe");
});

test("returns empty string for invalid root payload", () => {
  const out = serializeToBlockLanguage(null as unknown as SerializedNodes);
  assert.equal(out, "");
});
