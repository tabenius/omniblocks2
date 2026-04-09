"use client";

import React from "react";
import Link from "next/link";

export const PreviewLinks = ({ slugParam }: { slugParam?: string }) => {
  const previewHref = slugParam ? `/preview/${slugParam}` : "/preview";
  const previewEmailHref = slugParam ? `/preview-email/${slugParam}` : "/preview-email";
  const editHref = slugParam ? `/slug/edit/${slugParam}` : "/";
  const publishedHref = slugParam ? `/land/${slugParam}` : null;

  return (
    <div
      className="fixed right-4 top-4 z-50 rounded-md border border-slate-300 bg-white/95 p-2 shadow-sm backdrop-blur"
      style={{ fontFamily: "var(--font-default)" }}
    >
      <div className="grid grid-cols-2 gap-2">
        <Link
          href={editHref}
          className="rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100 text-center"
        >
          Editor
        </Link>
        <Link
          href="/style-editor"
          className="rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100 text-center"
        >
          Style
        </Link>
        <Link
          href={previewHref}
          className="rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100 text-center"
        >
          Preview
        </Link>
        <Link
          href={previewEmailHref}
          className="rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100 text-center"
        >
          Preview Email
        </Link>
        {publishedHref ? (
          <Link
            href={publishedHref}
            className="rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100 text-center"
          >
            Published (ISR)
          </Link>
        ) : null}
      </div>
    </div>
  );
};
