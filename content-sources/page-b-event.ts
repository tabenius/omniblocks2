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

export const PAGE_B_TITLE = "B. Event Advert";
export const PAGE_B_DESCRIPTION = "Consent-led white tantra event ad with circle-of-trust teachings and a supervised cuddle party closing.";

export const pageBEventSource: SerializedNodes = {
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
      "subtitle",
      "safetyIntro",
      "agendaTitle",
      "agendaRow",
      "trustTitle",
      "trustP1",
      "trustP2",
      "closingBox",
    ],
  }),

  title: node({
    type: "Heading",
    displayName: "Heading",
    parent: "ROOT",
    props: {
      text: "Evening of Trust, Presence, and Grounded Connection",
      level: 1,
      color: "var(--color-foreground)",
      textAlign: "left",
    },
  }),
  subtitle: node({
    type: "Paragraph",
    displayName: "Paragraph",
    parent: "ROOT",
    props: {
      text: "A consent-centered neo-tantra event within a white tantra safety paradigm.",
      fontSize: "var(--text-lg)",
      color: "var(--color-foreground)",
      textAlign: "left",
    },
  }),
  safetyIntro: node({
    type: "Paragraph",
    displayName: "Paragraph",
    parent: "ROOT",
    props: {
      text: "All exercises are opt-in. Clear boundaries, verbal consent, and trauma-aware facilitation are required in every segment.",
      fontSize: "var(--text-base)",
      color: "var(--color-muted-foreground)",
      textAlign: "left",
    },
  }),

  agendaTitle: node({
    type: "Heading",
    displayName: "Heading",
    parent: "ROOT",
    props: {
      text: "Program Flow",
      level: 2,
      color: "var(--color-foreground)",
      textAlign: "left",
    },
  }),
  agendaRow: node({
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
      "column-0": "agendaCol0",
      "column-1": "agendaCol1",
    },
  }),
  agendaCol0: node({
    type: "Container",
    displayName: "Container",
    isCanvas: true,
    parent: "agendaRow",
    props: {
      padding: "16px",
      background: "var(--color-surface)",
    },
    nodes: ["agenda0Title", "agenda0P1", "agenda0P2", "agenda0P3"],
  }),
  agenda0Title: node({ type: "Heading", displayName: "Heading", parent: "agendaCol0", props: { text: "Session Arc", level: 3, color: "var(--color-foreground)", textAlign: "left" } }),
  agenda0P1: node({ type: "Paragraph", displayName: "Paragraph", parent: "agendaCol0", props: { text: "1) Arrival and nervous-system settling", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)", textAlign: "left" } }),
  agenda0P2: node({ type: "Paragraph", displayName: "Paragraph", parent: "agendaCol0", props: { text: "2) Circle of trust teachings and partner communication drills", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)", textAlign: "left" } }),
  agenda0P3: node({ type: "Paragraph", displayName: "Paragraph", parent: "agendaCol0", props: { text: "3) Integration and supervised cuddle party close", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)", textAlign: "left" } }),

  agendaCol1: node({
    type: "Container",
    displayName: "Container",
    isCanvas: true,
    parent: "agendaRow",
    props: {
      padding: "16px",
      background: "var(--color-surface)",
    },
    nodes: ["agenda1Title", "agenda1P1", "agenda1P2", "agenda1P3"],
  }),
  agenda1Title: node({ type: "Heading", displayName: "Heading", parent: "agendaCol1", props: { text: "Safety Commitments", level: 3, color: "var(--color-foreground)", textAlign: "left" } }),
  agenda1P1: node({ type: "Paragraph", displayName: "Paragraph", parent: "agendaCol1", props: { text: "No pressure to participate in any touch practice", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)", textAlign: "left" } }),
  agenda1P2: node({ type: "Paragraph", displayName: "Paragraph", parent: "agendaCol1", props: { text: "Explicit yes/no check-ins before and during every exercise", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)", textAlign: "left" } }),
  agenda1P3: node({ type: "Paragraph", displayName: "Paragraph", parent: "agendaCol1", props: { text: "Facilitators intervene immediately on boundary uncertainty", fontSize: "var(--text-sm)", color: "var(--color-muted-foreground)", textAlign: "left" } }),

  trustTitle: node({
    type: "Heading",
    displayName: "Heading",
    parent: "ROOT",
    props: {
      text: "Circle of Trust Teaching Focus",
      level: 2,
      color: "var(--color-foreground)",
      textAlign: "left",
    },
  }),
  trustP1: node({
    type: "Paragraph",
    displayName: "Paragraph",
    parent: "ROOT",
    props: {
      text: "We practice pacing, attunement, and repair language so participants can recognize consent, hesitation, and emotional safety in real time.",
      fontSize: "var(--text-base)",
      color: "var(--color-muted-foreground)",
      textAlign: "left",
    },
  }),
  trustP2: node({
    type: "Paragraph",
    displayName: "Paragraph",
    parent: "ROOT",
    props: {
      text: "The goal is not intensity. The goal is trustworthy connection supported by clear agreements.",
      fontSize: "var(--text-base)",
      color: "var(--color-muted-foreground)",
      textAlign: "left",
    },
  }),

  closingBox: node({
    type: "PrimaryBox",
    displayName: "PrimaryBox",
    isCanvas: true,
    parent: "ROOT",
    props: {
      padding: "var(--space-lg)",
      gap: "var(--space-sm)",
      background: "var(--color-primary)",
      color: "var(--color-primary-foreground)",
    },
    nodes: ["closeTitle", "closeP1", "closeP2", "closeP3"],
  }),
  closeTitle: node({ type: "Heading", displayName: "Heading", parent: "closingBox", props: { text: "Closing: Supervised Cuddle Party", level: 3, color: "var(--color-primary-foreground)", textAlign: "left" } }),
  closeP1: node({ type: "Paragraph", displayName: "Paragraph", parent: "closingBox", props: { text: "The evening ends with a cuddle party supervised by two qualified leaders from the neo-tantra community.", fontSize: "var(--text-sm)", color: "var(--color-primary-foreground)", textAlign: "left" } }),
  closeP2: node({ type: "Paragraph", displayName: "Paragraph", parent: "closingBox", props: { text: "Leaders: Mara Nilsson (somatic practitioner) and David Roemer (consent educator).", fontSize: "var(--text-sm)", color: "var(--color-primary-foreground)", textAlign: "left" } }),
  closeP3: node({ type: "Paragraph", displayName: "Paragraph", parent: "closingBox", props: { text: "Cuddle participation is optional, clothed, and continuously consent-checked.", fontSize: "var(--text-sm)", color: "#fef08a", textAlign: "left" } }),
};
