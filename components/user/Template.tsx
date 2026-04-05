"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import {
  TextAreaField,
  SelectField,
  RemSliderField,
  FieldStack,
} from "@/components/editor/fields";

export type TemplateView = "rendered" | "source";

export type TemplateProps = {
  template?: string;
  view?: TemplateView;
  background?: string;
  padding?: string;
  borderRadius?: string;
};

const DEFAULT_TEMPLATE = `<button hx-get="/api/hello"
        hx-trigger="click"
        hx-target="#result"
        hx-swap="innerHTML"
        class="px-3 py-2 rounded bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
  Load
</button>
<div id="result" class="mt-2 text-sm text-[var(--color-muted-foreground)]">
  (response will appear here)
</div>`;

let htmxLoaded = false;

export const Template = ({
  template = DEFAULT_TEMPLATE,
  view = "source",
  background = "var(--color-surface)",
  padding = "var(--space-md)",
  borderRadius = "var(--radius-md)",
}: TemplateProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const mountRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (view !== "rendered") return;
    let cancelled = false;
    (async () => {
      const mod = (await import("htmx.org")) as unknown as {
        default?: { process: (el: Element) => void };
        process?: (el: Element) => void;
      };
      if (cancelled) return;
      const htmx = mod.default ?? mod;
      if (!htmxLoaded) {
        // htmx auto-processes body on load; make it globally available
        (window as unknown as { htmx: typeof htmx }).htmx = htmx;
        htmxLoaded = true;
      }
      if (mountRef.current && htmx.process) {
        htmx.process(mountRef.current);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [template, view]);

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
          {template}
        </pre>
      ) : (
        <div ref={mountRef} dangerouslySetInnerHTML={{ __html: template }} />
      )}
    </div>
  );
};

const TemplateSettings = () => (
  <FieldStack>
    <SelectField
      label="View"
      propKey="view"
      options={[
        { label: "Source", value: "source" },
        { label: "Rendered (htmx)", value: "rendered" },
      ]}
    />
    <TextAreaField label="Template (htmx)" propKey="template" rows={12} />
    <RemSliderField label="Padding" propKey="padding" min={0} max={10} step={0.25} fallback={1} />
    <RemSliderField label="Border radius" propKey="borderRadius" min={0} max={4} step={0.125} fallback={0.5} />
  </FieldStack>
);

Template.craft = {
  displayName: "Template",
  props: {
    template: DEFAULT_TEMPLATE,
    view: "source",
    background: "var(--color-surface)",
    padding: "var(--space-md)",
    borderRadius: "var(--radius-md)",
  },
  related: { settings: TemplateSettings },
};
