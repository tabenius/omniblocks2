"use client";
import React from "react";
import { Editor, Frame, Element, useEditor } from "@craftjs/core";
import { resolver } from "@/lib/resolver";
import { Container } from "@/components/user/Container";
import { Heading } from "@/components/user/Heading";
import { Paragraph } from "@/components/user/Paragraph";
import { Toolbox } from "./Toolbox";
import { SettingsPanel } from "./SettingsPanel";
import { PreviewEmail } from "./PreviewEmail";
import { RenderNode } from "./RenderNode";
import { serializeToBlockLanguage } from "@/lib/blockSerializer";

export const STORAGE_KEY = "omnieditor-content";

type ContentTheme = "content-light" | "content-dark";

// ── AutoSaveLoader ────────────────────────────────────────────────
// Must live inside <Editor> to access useEditor
const AutoSaveLoader = () => {
  const { actions, query, nodes } = useEditor((state) => ({
    nodes: state.nodes,
  }));
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { actions.deserialize(saved); } catch (e) {
        console.warn("Failed to restore editor state:", e);
      }
    }
    setLoaded(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(query.getSerializedNodes()));
      } catch { /* storage full */ }
    }, 800);
    return () => clearTimeout(timer);
  }, [loaded, nodes]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

// ── CopySourceButton ──────────────────────────────────────────────
const CopySourceButton = () => {
  const { query } = useEditor();
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    const src = serializeToBlockLanguage(query.getSerializedNodes());
    navigator.clipboard.writeText(src).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={copy}
      className="w-full px-3 py-2 text-sm rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)] text-[var(--color-foreground)] transition-colors"
    >
      {copied ? "Copied!" : "Copy Source"}
    </button>
  );
};

// ── ContentThemeToggle ────────────────────────────────────────────
const ContentThemeToggle = ({
  value,
  onChange,
}: {
  value: ContentTheme;
  onChange: (t: ContentTheme) => void;
}) => (
  <div
    className="flex rounded-md overflow-hidden border border-[var(--color-border)]"
    style={{ fontSize: 12 }}
  >
    {(["content-light", "content-dark"] as ContentTheme[]).map((t) => (
      <button
        key={t}
        onClick={() => onChange(t)}
        style={{
          flex: 1,
          padding: "5px 0",
          background: value === t ? "var(--color-primary)" : "var(--color-secondary)",
          color: value === t ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "background 0.15s, color 0.15s",
        }}
      >
        {t === "content-light" ? "☀ Light" : "☾ Dark"}
      </button>
    ))}
  </div>
);

// ── EditorShell ───────────────────────────────────────────────────
export default function EditorShell() {
  const [contentTheme, setContentTheme] = React.useState<ContentTheme>("content-light");

  return (
    <div className="flex h-screen" style={{ fontFamily: "var(--font-default)" }}>
      <Editor resolver={resolver} renderNode={RenderNode}>
        <AutoSaveLoader />

        {/* Left sidebar — editor chrome */}
        <aside
          data-theme="editor"
          className="w-64 border-r border-[var(--color-border)] p-4 overflow-y-auto flex flex-col gap-4"
        >
          <h2
            className="font-bold text-sm tracking-wide uppercase"
            style={{ color: "var(--color-accent)", letterSpacing: "0.1em" }}
          >
            Blocks
          </h2>
          <Toolbox />
        </aside>

        {/* Canvas — content theme */}
        <main
          data-theme={contentTheme}
          className="flex-1 p-8 overflow-y-auto"
        >
          <Frame>
            <Element is={Container} canvas padding="24px" background="var(--color-background)">
              <Heading text="Welcome to the editor" level={1} />
              <Paragraph text="Start building by dragging blocks from the left." />
            </Element>
          </Frame>
        </main>

        {/* Right sidebar — editor chrome */}
        <aside
          data-theme="editor"
          className="w-72 border-l border-[var(--color-border)] p-4 overflow-y-auto flex flex-col gap-4"
        >
          <PreviewEmail />
          <CopySourceButton />
          <ContentThemeToggle value={contentTheme} onChange={setContentTheme} />

          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              paddingTop: 16,
              marginTop: 4,
            }}
          >
            <h2
              className="font-bold text-sm tracking-wide uppercase mb-4"
              style={{ color: "var(--color-accent)", letterSpacing: "0.1em" }}
            >
              Settings
            </h2>
            <SettingsPanel />
          </div>
        </aside>
      </Editor>
    </div>
  );
}
