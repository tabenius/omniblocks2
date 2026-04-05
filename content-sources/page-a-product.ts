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

export const PAGE_A_TITLE = "A. Product Landing";
export const PAGE_A_DESCRIPTION = "Product landing with screenshot, feature grid, and Basic/Pro/Max pricing with Pro sale.";

export const pageAProductSource: SerializedNodes = {
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
      "hero",
      "featuresTitle",
      "featuresRow",
      "pricingTitle",
      "plansRow",
      "closing",
    ],
  }),

  hero: node({
    type: "Hero",
    displayName: "Hero",
    isCanvas: true,
    parent: "ROOT",
    props: {
      padding: "var(--space-3xl) var(--space-xl)",
      gap: "var(--space-md)",
      background: "var(--color-muted)",
      textAlign: "center",
    },
    nodes: ["heroTitle", "heroSub", "heroImage", "heroNote"],
  }),
  heroTitle: node({
    type: "Heading",
    displayName: "Heading",
    parent: "hero",
    props: {
      text: "Ship Better UI Reviews in Minutes",
      level: 1,
      color: "var(--color-foreground)",
      textAlign: "center",
    },
  }),
  heroSub: node({
    type: "Paragraph",
    displayName: "Paragraph",
    parent: "hero",
    props: {
      text: "Annotate screenshots, collect threaded feedback, and align your team with one clear decision trail.",
      fontSize: "var(--text-lg)",
      color: "var(--color-muted-foreground)",
      textAlign: "center",
    },
  }),
  heroImage: node({
    type: "ImageBlock",
    displayName: "Image",
    parent: "hero",
    props: {
      src: "/mock-product-ui.svg",
      alt: "Product screenshot mock",
      width: "100%",
      maxWidth: "920px",
      borderRadius: "12px",
      align: "center",
    },
  }),
  heroNote: node({
    type: "Paragraph",
    displayName: "Paragraph",
    parent: "hero",
    props: {
      text: "Trusted by product teams shipping weekly across design, growth, and engineering.",
      fontSize: "var(--text-sm)",
      color: "var(--color-muted-foreground)",
      textAlign: "center",
    },
  }),

  featuresTitle: node({
    type: "Heading",
    displayName: "Heading",
    parent: "ROOT",
    props: {
      text: "Feature Highlights",
      level: 2,
      color: "var(--color-foreground)",
      textAlign: "left",
    },
  }),
  featuresRow: node({
    type: "LayoutBlock",
    displayName: "LayoutBlock",
    parent: "ROOT",
    props: {
      columns: 3,
      gap: "16px",
      padding: "0px",
      background: "transparent",
    },
    linkedNodes: {
      "column-0": "featCol0",
      "column-1": "featCol1",
      "column-2": "featCol2",
    },
  }),
  featCol0: node({
    type: "Container",
    displayName: "Container",
    isCanvas: true,
    parent: "featuresRow",
    props: {
      padding: "16px",
      background: "var(--color-surface)",
    },
    nodes: ["feat0Title", "feat0Body"],
  }),
  feat0Title: node({
    type: "Heading",
    displayName: "Heading",
    parent: "featCol0",
    props: { text: "Visual Diff Timeline", level: 3, color: "var(--color-foreground)", textAlign: "left" },
  }),
  feat0Body: node({
    type: "Paragraph",
    displayName: "Paragraph",
    parent: "featCol0",
    props: {
      text: "Track each design revision and compare before/after changes without losing context.",
      fontSize: "var(--text-base)",
      color: "var(--color-muted-foreground)",
      textAlign: "left",
    },
  }),
  featCol1: node({
    type: "Container",
    displayName: "Container",
    isCanvas: true,
    parent: "featuresRow",
    props: {
      padding: "16px",
      background: "var(--color-surface)",
    },
    nodes: ["feat1Title", "feat1Body"],
  }),
  feat1Title: node({
    type: "Heading",
    displayName: "Heading",
    parent: "featCol1",
    props: { text: "Inline Approval Gates", level: 3, color: "var(--color-foreground)", textAlign: "left" },
  }),
  feat1Body: node({
    type: "Paragraph",
    displayName: "Paragraph",
    parent: "featCol1",
    props: {
      text: "Move from draft to approved with explicit sign-off checkpoints for design and legal.",
      fontSize: "var(--text-base)",
      color: "var(--color-muted-foreground)",
      textAlign: "left",
    },
  }),
  featCol2: node({
    type: "Container",
    displayName: "Container",
    isCanvas: true,
    parent: "featuresRow",
    props: {
      padding: "16px",
      background: "var(--color-surface)",
    },
    nodes: ["feat2Title", "feat2Body"],
  }),
  feat2Title: node({
    type: "Heading",
    displayName: "Heading",
    parent: "featCol2",
    props: { text: "Automated Handoff Notes", level: 3, color: "var(--color-foreground)", textAlign: "left" },
  }),
  feat2Body: node({
    type: "Paragraph",
    displayName: "Paragraph",
    parent: "featCol2",
    props: {
      text: "Generate implementation notes directly from resolved comments and accepted deltas.",
      fontSize: "var(--text-base)",
      color: "var(--color-muted-foreground)",
      textAlign: "left",
    },
  }),

  pricingTitle: node({
    type: "Heading",
    displayName: "Heading",
    parent: "ROOT",
    props: {
      text: "Choose Your Plan",
      level: 2,
      color: "var(--color-foreground)",
      textAlign: "left",
    },
  }),
  plansRow: node({
    type: "LayoutBlock",
    displayName: "LayoutBlock",
    parent: "ROOT",
    props: {
      columns: 3,
      gap: "16px",
      padding: "0px",
      background: "transparent",
    },
    linkedNodes: {
      "column-0": "planBasic",
      "column-1": "planPro",
      "column-2": "planMax",
    },
  }),
  planBasic: node({
    type: "Container",
    displayName: "Container",
    isCanvas: true,
    parent: "plansRow",
    props: {
      padding: "16px",
      background: "var(--color-surface)",
    },
    nodes: ["basicTitle", "basicPrice", "basicLine1", "basicLine2"],
  }),
  basicTitle: node({ type: "Heading", displayName: "Heading", parent: "planBasic", props: { text: "Basic", level: 3, color: "var(--color-foreground)", textAlign: "left" } }),
  basicPrice: node({ type: "Paragraph", displayName: "Paragraph", parent: "planBasic", props: { text: "$19/mo", fontSize: "var(--text-lg)", color: "var(--color-foreground)", textAlign: "left" } }),
  basicLine1: node({ type: "Paragraph", displayName: "Paragraph", parent: "planBasic", props: { text: "Up to 5 projects", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)", textAlign: "left" } }),
  basicLine2: node({ type: "Paragraph", displayName: "Paragraph", parent: "planBasic", props: { text: "Core comments and approvals", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)", textAlign: "left" } }),

  planPro: node({
    type: "PrimaryBox",
    displayName: "PrimaryBox",
    isCanvas: true,
    parent: "plansRow",
    props: {
      padding: "var(--space-lg)",
      gap: "var(--space-sm)",
      background: "var(--color-primary)",
      color: "var(--color-primary-foreground)",
    },
    nodes: ["proTitle", "proPrice", "proSale", "proLine1", "proLine2"],
  }),
  proTitle: node({ type: "Heading", displayName: "Heading", parent: "planPro", props: { text: "Pro", level: 3, color: "var(--color-primary-foreground)", textAlign: "left" } }),
  proPrice: node({ type: "Paragraph", displayName: "Paragraph", parent: "planPro", props: { text: "$39/mo", fontSize: "var(--text-lg)", color: "var(--color-primary-foreground)", textAlign: "left" } }),
  proSale: node({ type: "Paragraph", displayName: "Paragraph", parent: "planPro", props: { text: "Sale: 25% off for first 3 months", fontSize: "var(--text-sm)", color: "#fef08a", textAlign: "left" } }),
  proLine1: node({ type: "Paragraph", displayName: "Paragraph", parent: "planPro", props: { text: "Unlimited projects", fontSize: "var(--text-sm)", color: "var(--color-primary-foreground)", textAlign: "left" } }),
  proLine2: node({ type: "Paragraph", displayName: "Paragraph", parent: "planPro", props: { text: "Automation + Slack handoff", fontSize: "var(--text-sm)", color: "var(--color-primary-foreground)", textAlign: "left" } }),

  planMax: node({
    type: "Container",
    displayName: "Container",
    isCanvas: true,
    parent: "plansRow",
    props: {
      padding: "16px",
      background: "var(--color-surface)",
    },
    nodes: ["maxTitle", "maxPrice", "maxLine1", "maxLine2"],
  }),
  maxTitle: node({ type: "Heading", displayName: "Heading", parent: "planMax", props: { text: "Max", level: 3, color: "var(--color-foreground)", textAlign: "left" } }),
  maxPrice: node({ type: "Paragraph", displayName: "Paragraph", parent: "planMax", props: { text: "$89/mo", fontSize: "var(--text-lg)", color: "var(--color-foreground)", textAlign: "left" } }),
  maxLine1: node({ type: "Paragraph", displayName: "Paragraph", parent: "planMax", props: { text: "Dedicated success manager", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)", textAlign: "left" } }),
  maxLine2: node({ type: "Paragraph", displayName: "Paragraph", parent: "planMax", props: { text: "Enterprise SSO + audit export", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)", textAlign: "left" } }),

  closing: node({
    type: "Paragraph",
    displayName: "Paragraph",
    parent: "ROOT",
    props: {
      text: "Start with Basic, move to Pro while the sale is active, or scale with Max when you need governance.",
      fontSize: "var(--text-base)",
      color: "var(--color-foreground)",
      textAlign: "left",
    },
  }),
};
