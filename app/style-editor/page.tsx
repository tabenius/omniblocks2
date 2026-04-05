"use client";

import EditorShell from "@/components/editor/EditorShell";

export default function StyleEditorPage() {
  return (
    <div className="min-h-screen">
      <EditorShell initialToolbarTab="style" mode="style-only" />
    </div>
  );
}
