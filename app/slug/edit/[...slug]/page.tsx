"use client";

import { useParams } from "next/navigation";
import EditorShell from "@/components/editor/EditorShell";

export default function EditPage() {
  const params = useParams<{ slug?: string[] }>();
  const slug = Array.isArray(params?.slug) ? params.slug.join("/") : undefined;
  return (
    <div className="min-h-screen">
      <EditorShell initialDocSlug={slug} />
    </div>
  );
}
