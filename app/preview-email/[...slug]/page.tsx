"use client";

import { useParams } from "next/navigation";
import { EmailPreviewClient } from "@/components/previews/EmailPreviewClient";

export default function PreviewEmailSlugPage() {
  const params = useParams<{ slug?: string[] }>();
  const slugParam = Array.isArray(params?.slug) ? params.slug.join("/") : undefined;
  return <EmailPreviewClient slugParam={slugParam} />;
}

