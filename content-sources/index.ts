import type { SerializedNodes } from "@craftjs/core";
import { serializeToBlockLanguage } from "@/lib/blockSerializer";
import { PAGE_A_DESCRIPTION, PAGE_A_TITLE, pageAProductSource } from "@/content-sources/page-a-product";
import { PAGE_B_DESCRIPTION, PAGE_B_TITLE, pageBEventSource } from "@/content-sources/page-b-event";
import { PAGE_C_DESCRIPTION, PAGE_C_TITLE, pageCCourseSource } from "@/content-sources/page-c-course";

export type ExampleTemplate = {
  id: string;
  title: string;
  description: string;
  nodes: SerializedNodes;
  blockSource: string;
};

function freezeTemplateNodes<T extends SerializedNodes>(nodes: T): T {
  for (const node of Object.values(nodes)) {
    Object.freeze(node.props);
    Object.freeze(node.nodes);
    Object.freeze(node.linkedNodes);
    Object.freeze(node);
  }
  return Object.freeze(nodes);
}

const pageA = freezeTemplateNodes(pageAProductSource);
const pageB = freezeTemplateNodes(pageBEventSource);
const pageC = freezeTemplateNodes(pageCCourseSource);

export const EXAMPLE_TEMPLATES: readonly ExampleTemplate[] = Object.freeze([
  {
    id: "page-a-product",
    title: PAGE_A_TITLE,
    description: PAGE_A_DESCRIPTION,
    nodes: pageA,
    blockSource: serializeToBlockLanguage(pageA),
  },
  {
    id: "page-b-event",
    title: PAGE_B_TITLE,
    description: PAGE_B_DESCRIPTION,
    nodes: pageB,
    blockSource: serializeToBlockLanguage(pageB),
  },
  {
    id: "page-c-course",
    title: PAGE_C_TITLE,
    description: PAGE_C_DESCRIPTION,
    nodes: pageC,
    blockSource: serializeToBlockLanguage(pageC),
  },
]);
