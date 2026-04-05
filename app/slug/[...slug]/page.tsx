"use client";
import React from "react";
import Link from "next/link";
import { Editor, Frame } from "@craftjs/core";
import { resolver } from "@/lib/resolver";
import { Container } from "@/components/user/Container";
import { Heading } from "@/components/user/Heading";
import { Paragraph } from "@/components/user/Paragraph";
import { STORAGE_KEY } from "@/components/editor/EditorShell";

export default function SlugPage() {
  const [data, setData] = React.useState<string | undefined>(undefined);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setData(saved ?? undefined);
    setReady(true);
  }, []);

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
          href="/"
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

      <Editor resolver={resolver} enabled={false}>
        <Frame data={data}>
          {/* Fallback shown when nothing is saved */}
          <Container padding="48px" background="#ffffff">
            <Heading text="No content saved yet." level={1} />
            <Paragraph text="Open the editor at / to create content." />
          </Container>
        </Frame>
      </Editor>
    </div>
  );
}
