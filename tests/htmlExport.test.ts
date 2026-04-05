import test from "node:test";
import assert from "node:assert/strict";
import type { SerializedNodes } from "@craftjs/core";
import { buildStaticHtmlDocument } from "../lib/htmlExport";

function asNodes(input: unknown): SerializedNodes {
  return input as SerializedNodes;
}

test("buildStaticHtmlDocument renders common blocks", () => {
  const nodes = asNodes({
    ROOT: { nodes: ["container"], linkedNodes: {}, props: {}, type: "div" },
    container: {
      nodes: ["h1", "p"],
      linkedNodes: {},
      props: { padding: "24px", background: "#fff" },
      displayName: "Container",
      type: "Container",
    },
    h1: {
      nodes: [],
      linkedNodes: {},
      props: { level: 2, text: "Hello" },
      displayName: "Heading",
      type: "Heading",
    },
    p: {
      nodes: [],
      linkedNodes: {},
      props: { text: "World" },
      displayName: "Paragraph",
      type: "Paragraph",
    },
  });

  const html = buildStaticHtmlDocument(nodes, { title: "Sample Export" });
  assert.match(html, /<title>Sample Export<\/title>/);
  assert.match(html, /<h2[^>]*>Hello<\/h2>/);
  assert.match(html, /<p[^>]*>World<\/p>/);
});

test("buildStaticHtmlDocument handles malformed trees defensively", () => {
  const nodes = asNodes({
    ROOT: { nodes: ["a", "missing"], linkedNodes: {}, props: {}, type: "div" },
    a: {
      nodes: ["a", "b"],
      linkedNodes: { col0: "missing2" },
      props: {},
      displayName: "TextBlock",
      type: "TextBlock",
    },
    b: {
      nodes: [],
      linkedNodes: {},
      props: { text: "Safe" },
      displayName: "Paragraph",
      type: "Paragraph",
    },
  });

  const html = buildStaticHtmlDocument(nodes);
  assert.match(html, /Safe/);
});

test("buildStaticHtmlDocument applies theme variable overrides", () => {
  const nodes = asNodes({
    ROOT: { nodes: [], linkedNodes: {}, props: {}, type: "div" },
  });
  const html = buildStaticHtmlDocument(nodes, {
    themeVariables: {
      "--color-background": "#101010",
    },
  });

  assert.match(html, /--color-background: #101010;/);
});

test("buildStaticHtmlDocument renders event and video blocks", () => {
  const nodes = asNodes({
    ROOT: { nodes: ["event", "video"], linkedNodes: {}, props: {}, type: "div" },
    event: {
      nodes: [],
      linkedNodes: {},
      props: {
        from: "2026-06-14",
        to: "2026-06-16",
        title: "Launch Week",
        text: "Three days of workshops.",
      },
      displayName: "Event",
      type: "Event",
    },
    video: {
      nodes: [],
      linkedNodes: {},
      props: {
        src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        title: "Trailer",
      },
      displayName: "Video",
      type: "Video",
    },
  });

  const html = buildStaticHtmlDocument(nodes);
  assert.match(html, /Launch Week/);
  assert.match(html, /iframe/);
  assert.match(html, /youtube\.com\/embed\/dQw4w9WgXcQ/);
});
