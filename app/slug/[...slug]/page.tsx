"use client";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { buildStaticHtmlDocument } from "@/lib/htmlExport";
import {
  parseSerializedNodes,
  readSerializedContent,
} from "@/components/previews/storage";

type StaticNodes = Parameters<typeof buildStaticHtmlDocument>[0];

export default function SlugPage() {
  const [html, setHtml] = React.useState<string>("");
  const [ready, setReady] = React.useState(false);
  const params = useParams<{ slug?: string[] }>();
  const slugParam = Array.isArray(params?.slug) ? params.slug.join("/") : "";

  React.useEffect(() => {
    const saved = readSerializedContent(slugParam);
    const parsed = parseSerializedNodes(saved);
    if (parsed) {
      setHtml(
        buildStaticHtmlDocument(parsed as StaticNodes, {
          title: slugParam || "document",
        }),
      );
    } else {
      setHtml("");
    }
    setReady(true);
  }, [slugParam]);

  if (!ready) return null;

  return (
    <div>
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 50,
        }}
      >
        <Link
          href={slugParam ? `/slug/edit/${slugParam}` : "/"}
          style={{
            background: "#111",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 6,
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          Edit
        </Link>
      </div>

      {html ? (
        <iframe
          title="static-preview"
          srcDoc={html}
          className="w-full min-h-screen border-0"
        />
      ) : (
        <div className="min-h-screen flex items-center justify-center p-8 bg-white text-center">
          <div className="max-w-md space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">No content saved yet.</h1>
            <p className="text-sm text-slate-600">Open the editor and save a named document first.</p>
          </div>
        </div>
      )}
    </div>
  );
}
