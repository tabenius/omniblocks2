"use client";

import { useParams } from "next/navigation";
import { StaticPreviewClient } from "@/components/previews/StaticPreviewClient";

export default function PreviewSlugPage() {
  const params = useParams<{ slug?: string[] }>();
  const slugParam = Array.isArray(params?.slug) ? params.slug.join("/") : undefined;
  return <StaticPreviewClient slugParam={slugParam} />;
}

