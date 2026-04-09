import type { SerializedNodes } from "@craftjs/core";
import { notFound } from "next/navigation";
import { buildStaticHtmlDocument } from "@/lib/htmlExport";
import { getR2Bucket } from "@/lib/r2Bindings";
import {
  coerceSavedPage,
  fileKeyForSavedPageSlug,
  getPagesPrefix,
  slugifySavedPage,
} from "@/lib/savedPages";
import { isRecord } from "@/lib/typeGuards";

export const revalidate = 300;
export const dynamic = "force-static";

export async function generateStaticParams() {
  return [];
}

async function loadSerializedNodes(slug: string): Promise<SerializedNodes | null> {
  const bucket = await getR2Bucket();
  if (!bucket) return null;

  const prefix = getPagesPrefix();
  const key = fileKeyForSavedPageSlug(prefix, slug);
  const object = await bucket.get(key);
  if (!object?.body) return null;

  try {
    const rawDoc = await object.body.text();
    const doc = coerceSavedPage(JSON.parse(rawDoc));
    if (!doc) return null;
    const parsed = JSON.parse(doc.content);
    if (!isRecord(parsed)) return null;
    return parsed as SerializedNodes;
  } catch {
    return null;
  }
}

export default async function LandSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = slugifySavedPage(rawSlug || "");
  if (!slug) notFound();

  const nodes = await loadSerializedNodes(slug);
  if (!nodes) notFound();

  const html = buildStaticHtmlDocument(nodes, {
    title: slug,
  });

  return (
    <iframe
      title={`land-${slug}`}
      srcDoc={html}
      style={{
        width: "100%",
        minHeight: "100vh",
        border: "0",
        display: "block",
      }}
    />
  );
}
