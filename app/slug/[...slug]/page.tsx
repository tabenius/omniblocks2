"use client";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { STORAGE_KEY } from "@/lib/editorStorage";
import { readSavedDocuments } from "@/lib/documentStore";
import { buildStaticHtmlDocument } from "@/lib/htmlExport";

type JsonRecord = Record<string, unknown>;
type StaticNodes = Parameters<typeof buildStaticHtmlDocument>[0];

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function parseSerializedNodes(raw: string | null): JsonRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export default function SlugPage() {
  const [html, setHtml] = React.useState<string>("");
  const [ready, setReady] = React.useState(false);
  const params = useParams<{ slug?: string[] }>();
  const slugParam = Array.isArray(params?.slug) ? params.slug.join("/") : "";

  React.useEffect(() => {
    const fromDoc = slugParam
      ? readSavedDocuments().find((doc) => doc.slug === slugParam)?.content
      : null;
    const saved = fromDoc ?? localStorage.getItem(STORAGE_KEY) ?? null;
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
