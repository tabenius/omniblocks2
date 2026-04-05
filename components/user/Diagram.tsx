"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import {
  TextAreaField,
  SelectField,
  TextField,
  FieldStack,
} from "@/components/editor/fields";

export type DiagramView = "rendered" | "source";

export type DiagramProps = {
  source?: string;
  view?: DiagramView;
  background?: string;
  padding?: string;
  borderRadius?: string;
};

const DEFAULT_SOURCE = `flowchart LR
  A[Editor JSON] --> B[Walker]
  B --> C[Web Render]
  B --> D[Email Render]`;

let mermaidInit = false;
let diagramCounter = 0;

export const Diagram = ({
  source = DEFAULT_SOURCE,
  view = "rendered",
  background = "var(--color-surface)",
  padding = "var(--space-md)",
  borderRadius = "var(--radius-md)",
}: DiagramProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const [svg, setSvg] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const idRef = React.useRef(`mmd-${++diagramCounter}`);

  React.useEffect(() => {
    if (view !== "rendered") return;
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        if (!mermaidInit) {
          mermaid.initialize({ startOnLoad: false, theme: "default", securityLevel: "loose" });
          mermaidInit = true;
        }
        const { svg } = await mermaid.render(idRef.current, source);
        if (!cancelled) {
          setSvg(svg);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message);
          setSvg("");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source, view]);

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        background,
        padding,
        borderRadius,
        border: "1px solid var(--color-border)",
        overflow: "auto",
      }}
    >
      {view === "source" ? (
        <pre
          style={{
            margin: 0,
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--color-foreground)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {source}
        </pre>
      ) : error ? (
        <div style={{ color: "var(--color-danger)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
          {error}
        </div>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      )}
    </div>
  );
};

const DiagramSettings = () => (
  <FieldStack>
    <SelectField
      label="View"
      propKey="view"
      options={[
        { label: "Rendered", value: "rendered" },
        { label: "Source", value: "source" },
      ]}
    />
    <TextAreaField label="Mermaid source" propKey="source" rows={10} />
    <TextField label="Padding" propKey="padding" />
    <TextField label="Border radius" propKey="borderRadius" />
  </FieldStack>
);

Diagram.craft = {
  displayName: "Diagram",
  props: {
    source: DEFAULT_SOURCE,
    view: "rendered",
    background: "var(--color-surface)",
    padding: "var(--space-md)",
    borderRadius: "var(--radius-md)",
  },
  related: { settings: DiagramSettings },
};
