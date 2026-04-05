"use client";
import React from "react";
import { Editor, Frame, Element } from "@craftjs/core";
import { resolver } from "@/lib/resolver";
import { Container } from "@/components/user/Container";
import { Heading } from "@/components/user/Heading";
import { Paragraph } from "@/components/user/Paragraph";
import { Toolbox } from "./Toolbox";
import { SettingsPanel } from "./SettingsPanel";
import { PreviewEmail } from "./PreviewEmail";

export default function EditorShell() {
  return (
    <div className="flex h-screen">
      <Editor resolver={resolver}>
        <aside className="w-64 border-r p-4 bg-white overflow-y-auto">
          <h2 className="font-bold mb-4">Blocks</h2>
          <Toolbox />
        </aside>

        <main className="flex-1 bg-gray-50 p-8 overflow-y-auto">
          <Frame>
            <Element is={Container} canvas padding="24px" background="#ffffff">
              <Heading text="Welcome to the editor" level={1} />
              <Paragraph text="Start building by dragging blocks from the left." />
            </Element>
          </Frame>
        </main>

        <aside className="w-72 border-l p-4 bg-white overflow-y-auto flex flex-col gap-4">
          <PreviewEmail />
          <div>
            <h2 className="font-bold mb-4">Settings</h2>
            <SettingsPanel />
          </div>
        </aside>
      </Editor>
    </div>
  );
}
