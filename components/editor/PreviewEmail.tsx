"use client";
import React from "react";
import { useEditor } from "@craftjs/core";
import { walkEmail } from "@/lib/emailWalker";
import { EmailDocument } from "@/components/renderers/email/EmailDocument";

export type ViewportMode = "mobile" | "desktop";

export const PreviewEmail = ({
  viewportMode,
}: {
  viewportMode: ViewportMode;
}) => {
  const { query } = useEditor();
  const [html, setHtml] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const isMobile = viewportMode === "mobile";
  const previewWidth = isMobile ? "390px" : "100%";
  const previewMaxWidth = isMobile ? "390px" : "1100px";

  const run = async () => {
    const serialized = query.getSerializedNodes();
    const tree = walkEmail(serialized, "ROOT");
    const { render } = await import("@react-email/render");
    const out = await render(
      <EmailDocument preview="Editor preview">{tree}</EmailDocument>
    );
    setHtml(out);
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={run}
        className="w-full px-3 py-2 text-sm rounded bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90"
      >
        Preview Email
      </button>
      {open && html && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-lg h-[85vh] overflow-hidden flex flex-col"
            style={{ width: previewWidth, maxWidth: previewMaxWidth }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <h3 className="font-bold text-sm">
                Email Preview ({isMobile ? "Mobile" : "Desktop"})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(html)}
                  className="text-xs px-2 py-1 border border-[var(--color-border)] rounded bg-[var(--color-secondary)] hover:bg-[var(--color-surface)] text-[var(--color-foreground)]"
                >
                  Copy HTML
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-xs px-2 py-1 border border-[var(--color-border)] rounded bg-[var(--color-secondary)] hover:bg-[var(--color-surface)] text-[var(--color-foreground)]"
                >
                  Close
                </button>
              </div>
            </div>
            <iframe
              title="email-preview"
              srcDoc={html}
              className="flex-1 w-full bg-gray-100"
            />
          </div>
        </div>
      )}
    </>
  );
};
