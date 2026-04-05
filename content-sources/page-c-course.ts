import type { SerializedNode, SerializedNodes } from "@craftjs/core";

function node(config: {
  type: string;
  displayName: string;
  isCanvas?: boolean;
  parent: string | null;
  props?: Record<string, unknown>;
  nodes?: string[];
  linkedNodes?: Record<string, string>;
}): SerializedNode {
  return {
    type: { resolvedName: config.type },
    displayName: config.displayName,
    isCanvas: config.isCanvas ?? false,
    parent: config.parent,
    props: config.props ?? {},
    nodes: config.nodes ?? [],
    linkedNodes: config.linkedNodes ?? {},
    hidden: false,
    custom: {},
  };
}

export const PAGE_C_TITLE = "C. Course Page";
export const PAGE_C_DESCRIPTION = "Four-part Psychosynthesis course page with Ferrucci practices and two pathways from vision to action and action to vision.";

export const pageCCourseSource: SerializedNodes = {
  ROOT: node({
    type: "Container",
    displayName: "Container",
    isCanvas: true,
    parent: null,
    props: {
      padding: "24px",
      background: "var(--color-background)",
    },
    nodes: [
      "title",
      "intro",
      "partsTitle",
      "partsRow1",
      "partsRow2",
      "pathsTitle",
      "pathsRow",
      "closing",
    ],
  }),

  title: node({
    type: "Heading",
    displayName: "Heading",
    parent: "ROOT",
    props: {
      text: "Psychosynthesis in Practice: A Four-Part Learning Journey",
      level: 1,
      color: "var(--color-foreground)",
      textAlign: "left",
    },
  }),
  intro: node({
    type: "Paragraph",
    displayName: "Paragraph",
    parent: "ROOT",
    props: {
      text: "This course follows the spirit of Roberto Assagioli and Piero Ferrucci, integrating self-observation, goodwill, and the disciplined use of will.",
      fontSize: "var(--text-lg)",
      color: "var(--color-muted-foreground)",
      textAlign: "left",
    },
  }),

  partsTitle: node({
    type: "Heading",
    displayName: "Heading",
    parent: "ROOT",
    props: {
      text: "Course Structure: Four Events",
      level: 2,
      color: "var(--color-foreground)",
      textAlign: "left",
    },
  }),

  partsRow1: node({
    type: "LayoutBlock",
    displayName: "LayoutBlock",
    parent: "ROOT",
    props: {
      columns: 2,
      gap: "16px",
      padding: "0px",
      background: "transparent",
    },
    linkedNodes: {
      "column-0": "part1",
      "column-1": "part2",
    },
  }),
  part1: node({
    type: "Container",
    displayName: "Container",
    isCanvas: true,
    parent: "partsRow1",
    props: { padding: "16px", background: "var(--color-surface)" },
    nodes: ["part1Title", "part1Body"],
  }),
  part1Title: node({ type: "Heading", displayName: "Heading", parent: "part1", props: { text: "Part 1: Psychosynthesis Foundations", level: 3, color: "var(--color-foreground)", textAlign: "left" } }),
  part1Body: node({ type: "Paragraph", displayName: "Paragraph", parent: "part1", props: { text: "Subpersonalities, observing self, and disidentification methods for stable inner witnessing.", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)", textAlign: "left" } }),

  part2: node({
    type: "Container",
    displayName: "Container",
    isCanvas: true,
    parent: "partsRow1",
    props: { padding: "16px", background: "var(--color-surface)" },
    nodes: ["part2Title", "part2Body"],
  }),
  part2Title: node({ type: "Heading", displayName: "Heading", parent: "part2", props: { text: "Part 2: Piero Ferrucci Practices", level: 3, color: "var(--color-foreground)", textAlign: "left" } }),
  part2Body: node({ type: "Paragraph", displayName: "Paragraph", parent: "part2", props: { text: "Exercises in kindness, appreciative attention, and practical goodwill in relationships and work.", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)", textAlign: "left" } }),

  partsRow2: node({
    type: "LayoutBlock",
    displayName: "LayoutBlock",
    parent: "ROOT",
    props: {
      columns: 2,
      gap: "16px",
      padding: "0px",
      background: "transparent",
    },
    linkedNodes: {
      "column-0": "part3",
      "column-1": "part4",
    },
  }),
  part3: node({
    type: "Container",
    displayName: "Container",
    isCanvas: true,
    parent: "partsRow2",
    props: { padding: "16px", background: "var(--color-surface)" },
    nodes: ["part3Title", "part3Body"],
  }),
  part3Title: node({ type: "Heading", displayName: "Heading", parent: "part3", props: { text: "Part 3: The Act of Will", level: 3, color: "var(--color-foreground)", textAlign: "left" } }),
  part3Body: node({ type: "Paragraph", displayName: "Paragraph", parent: "part3", props: { text: "Training strong, skillful, good, and transpersonal will to direct energy toward meaningful aims.", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)", textAlign: "left" } }),

  part4: node({
    type: "Container",
    displayName: "Container",
    isCanvas: true,
    parent: "partsRow2",
    props: { padding: "16px", background: "var(--color-surface)" },
    nodes: ["part4Title", "part4Body"],
  }),
  part4Title: node({ type: "Heading", displayName: "Heading", parent: "part4", props: { text: "Part 4: Integration Lab", level: 3, color: "var(--color-foreground)", textAlign: "left" } }),
  part4Body: node({ type: "Paragraph", displayName: "Paragraph", parent: "part4", props: { text: "Apply both pathways in real projects, with peer reflection and weekly commitment cycles.", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)", textAlign: "left" } }),

  pathsTitle: node({
    type: "Heading",
    displayName: "Heading",
    parent: "ROOT",
    props: {
      text: "Two Complementary Paths",
      level: 2,
      color: "var(--color-foreground)",
      textAlign: "left",
    },
  }),
  pathsRow: node({
    type: "LayoutBlock",
    displayName: "LayoutBlock",
    parent: "ROOT",
    props: {
      columns: 2,
      gap: "16px",
      padding: "0px",
      background: "transparent",
    },
    linkedNodes: {
      "column-0": "mysticPath",
      "column-1": "actionPath",
    },
  }),
  mysticPath: node({
    type: "PrimaryBox",
    displayName: "PrimaryBox",
    isCanvas: true,
    parent: "pathsRow",
    props: {
      padding: "var(--space-lg)",
      gap: "var(--space-sm)",
      background: "var(--color-primary)",
      color: "var(--color-primary-foreground)",
    },
    nodes: ["mysticTitle", "mysticP1", "mysticP2", "mysticP3"],
  }),
  mysticTitle: node({ type: "Heading", displayName: "Heading", parent: "mysticPath", props: { text: "Path 1: Mystic / Dreamer to Action", level: 3, color: "var(--color-primary-foreground)", textAlign: "left" } }),
  mysticP1: node({ type: "Paragraph", displayName: "Paragraph", parent: "mysticPath", props: { text: "1) Sense the image and deeper intention.", fontSize: "var(--text-sm)", color: "var(--color-primary-foreground)", textAlign: "left" } }),
  mysticP2: node({ type: "Paragraph", displayName: "Paragraph", parent: "mysticPath", props: { text: "2) Translate vision into a plan with milestones.", fontSize: "var(--text-sm)", color: "var(--color-primary-foreground)", textAlign: "left" } }),
  mysticP3: node({ type: "Paragraph", displayName: "Paragraph", parent: "mysticPath", props: { text: "3) Commit to the first concrete step and execute it within 24 hours.", fontSize: "var(--text-sm)", color: "#fef08a", textAlign: "left" } }),

  actionPath: node({
    type: "Container",
    displayName: "Container",
    isCanvas: true,
    parent: "pathsRow",
    props: {
      padding: "16px",
      background: "var(--color-surface)",
    },
    nodes: ["actionTitle", "actionP1", "actionP2", "actionP3"],
  }),
  actionTitle: node({ type: "Heading", displayName: "Heading", parent: "actionPath", props: { text: "Path 2: Action to Plan to Dream", level: 3, color: "var(--color-foreground)", textAlign: "left" } }),
  actionP1: node({ type: "Paragraph", displayName: "Paragraph", parent: "actionPath", props: { text: "1) Start from one concrete action already underway.", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)", textAlign: "left" } }),
  actionP2: node({ type: "Paragraph", displayName: "Paragraph", parent: "actionPath", props: { text: "2) Build the plan and gather the needed resources.", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)", textAlign: "left" } }),
  actionP3: node({ type: "Paragraph", displayName: "Paragraph", parent: "actionPath", props: { text: "3) Let the larger dream emerge from disciplined engagement.", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)", textAlign: "left" } }),

  closing: node({
    type: "Paragraph",
    displayName: "Paragraph",
    parent: "ROOT",
    props: {
      text: "Outcome: participants leave with an inner framework and an executable pathway they can apply to real life projects immediately.",
      fontSize: "var(--text-base)",
      color: "var(--color-foreground)",
      textAlign: "left",
    },
  }),
};
