import dynamic from "next/dynamic";

const EditorShell = dynamic(() => import("@/components/editor/EditorShell"), {
  ssr: true,
});

export default function Home() {
  return (
    <div className="min-h-screen">
      <EditorShell />
    </div>
  );
}
