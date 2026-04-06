"use client";

import React from "react";
import { buildStaticHtmlDocument } from "@/lib/htmlExport";
import { PreviewLinks } from "@/components/previews/PreviewLinks";
import {
  parseSerializedNodes,
  readPreviewThemeMode,
  readPreviewThemeVariables,
  readSerializedContent,
} from "@/components/previews/storage";

type StaticNodes = Parameters<typeof buildStaticHtmlDocument>[0];

export const StaticPreviewClient = ({ slugParam }: { slugParam?: string }) => {
  const [html, setHtml] = React.useState<string>("");
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const parsed = parseSerializedNodes(readSerializedContent(slugParam));
    if (parsed) {
      const mode = readPreviewThemeMode();
      const themeVariables = readPreviewThemeVariables(mode);
      setHtml(
        buildStaticHtmlDocument(parsed as StaticNodes, {
          title: slugParam || "document-preview",
          themeVariables,
        }),
      );
    } else {
      setHtml("");
    }
    setReady(true);
  }, [slugParam]);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-white">
      <PreviewLinks slugParam={slugParam} />
      {html ? (
        <iframe
          title="static-preview"
          srcDoc={html}
          className="w-full min-h-screen border-0"
        />
      ) : (
        <div className="min-h-screen flex items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">No content saved yet.</h1>
            <p className="text-sm text-slate-600">Open editor, save a named document, then return to preview.</p>
          </div>
        </div>
      )}
    </div>
  );
};
