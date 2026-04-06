"use client";

import React from "react";
import type { SerializedNodes } from "@craftjs/core";
import { walkEmail } from "@/lib/emailWalker";
import { EmailDocument } from "@/components/renderers/email/EmailDocument";
import { PreviewLinks } from "@/components/previews/PreviewLinks";
import {
  parseSerializedNodes,
  readPreviewThemeMode,
  readPreviewThemeVariables,
  readSerializedContent,
} from "@/components/previews/storage";

export const EmailPreviewClient = ({ slugParam }: { slugParam?: string }) => {
  const [html, setHtml] = React.useState<string>("");
  const [ready, setReady] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const parsed = parseSerializedNodes(readSerializedContent(slugParam));
        if (!parsed) {
          if (!cancelled) {
            setHtml("");
            setError("");
            setReady(true);
          }
          return;
        }

        const mode = readPreviewThemeMode();
        const themeVars = readPreviewThemeVariables(mode);
        const tree = walkEmail(parsed as SerializedNodes, "ROOT", themeVars);
        const { render } = await import("@react-email/render");
        const rendered = await render(
          <EmailDocument preview="Email preview">{tree}</EmailDocument>,
        );

        if (!cancelled) {
          setHtml(rendered);
          setError("");
          setReady(true);
        }
      } catch (e) {
        if (!cancelled) {
          setHtml("");
          setError(e instanceof Error ? e.message : "Failed to render email preview.");
          setReady(true);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [slugParam]);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-slate-100">
      <PreviewLinks slugParam={slugParam} />
      <div className="mx-auto max-w-[1120px] p-4">
        {html ? (
          <div className="rounded border border-slate-300 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 p-3">
              <h1 className="text-sm font-semibold text-slate-900">Email Preview</h1>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(html)}
                className="rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
              >
                Copy HTML
              </button>
            </div>
            <iframe title="email-preview" srcDoc={html} className="h-[85vh] w-full border-0" />
          </div>
        ) : (
          <div className="min-h-[60vh] flex items-center justify-center text-center">
            <div className="max-w-md space-y-2">
              <h1 className="text-2xl font-semibold text-slate-900">No email preview available.</h1>
              <p className="text-sm text-slate-600">
                {error || "Open editor, save a named document, then preview email."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

