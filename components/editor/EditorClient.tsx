"use client";

import dynamic from "next/dynamic";

const EditorShell = dynamic(() => import("@/components/editor/EditorShell"), {
  ssr: false,
});

export function EditorClient() {
  return <EditorShell />;
}
