"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import {
  TextAreaField,
  SelectField,
  RemSliderField,
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

const MERMAID_CDN_URL = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
const MERMAID_SCRIPT_ID = "omni-mermaid-runtime";

type MermaidRuntime = {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, text: string) => Promise<{ svg: string }>;
};

declare global {
  interface Window {
    mermaid?: MermaidRuntime;
    __omniMermaidLoader?: Promise<MermaidRuntime>;
  }
}

let mermaidInit = false;
let diagramCounter = 0;

function loadMermaidRuntime(): Promise<MermaidRuntime> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Mermaid runtime is only available in the browser."));
  }
  if (window.mermaid) {
    return Promise.resolve(window.mermaid);
  }
  if (window.__omniMermaidLoader) {
    return window.__omniMermaidLoader;
  }

  window.__omniMermaidLoader = new Promise<MermaidRuntime>((resolve, reject) => {
    const existing = document.getElementById(MERMAID_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      const checkLoaded = () => {
        if (window.mermaid) {
          resolve(window.mermaid);
        } else {
          reject(new Error("Mermaid script loaded but runtime was not found."));
        }
      };
      existing.addEventListener("load", checkLoaded, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Mermaid runtime script.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = MERMAID_SCRIPT_ID;
    script.src = MERMAID_CDN_URL;
    script.async = true;
    script.onload = () => {
      if (window.mermaid) {
        resolve(window.mermaid);
      } else {
        reject(new Error("Mermaid script loaded but runtime was not found."));
      }
    };
    script.onerror = () => reject(new Error("Failed to load Mermaid runtime script."));
    document.head.appendChild(script);
  });

  return window.__omniMermaidLoader;
}

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
        const mermaid = await loadMermaidRuntime();
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
    <a
      href="https://mermaid.js.org/syntax/flowchart.html"
      target="_blank"
      rel="noreferrer"
      className="text-xs text-[var(--color-accent)] underline"
    >
      Mermaid syntax manual
    </a>
    <SelectField
      label="View"
      propKey="view"
      options={[
        { label: "Rendered", value: "rendered" },
        { label: "Source", value: "source" },
      ]}
    />
    <TextAreaField label="Mermaid source" propKey="source" rows={10} />
    <RemSliderField label="Padding" propKey="padding" min={0} max={8} step={0.25} fallback={1} />
    <RemSliderField label="Border radius" propKey="borderRadius" min={0} max={4} step={0.125} fallback={0.5} />
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
