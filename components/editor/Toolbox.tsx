"use client";
import React from "react";
import { useEditor, Element } from "@craftjs/core";
import { Container } from "@/components/user/Container";
import { Heading } from "@/components/user/Heading";
import { Paragraph } from "@/components/user/Paragraph";
import { AlterParagraph } from "@/components/user/AlterParagraph";
import { TextBlock } from "@/components/user/TextBlock";
import { Hero } from "@/components/user/Hero";
import { PrimaryBox } from "@/components/user/PrimaryBox";
import { LayoutBlock } from "@/components/user/LayoutBlock";
import { ImageBlock } from "@/components/user/ImageBlock";
import { Masonry } from "@/components/user/Masonry";
import { Asset } from "@/components/user/Asset";
import { Author } from "@/components/user/Author";
import { Quote } from "@/components/user/Quote";
import { Diagram } from "@/components/user/Diagram";
import { Audio } from "@/components/user/Audio";
import { Template } from "@/components/user/Template";

export const Toolbox = () => {
  const { connectors } = useEditor();

  const items: Array<{ label: string; group: string; create: React.ReactElement }> = [
    { label: "H1", group: "Inline", create: <Heading text="Heading 1" level={1} /> },
    { label: "H2", group: "Inline", create: <Heading text="Heading 2" level={2} /> },
    { label: "H3", group: "Inline", create: <Heading text="Heading 3" level={3} /> },
    { label: "Paragraph", group: "Inline", create: <Paragraph text="Paragraph text" /> },
    {
      label: "AlterParagraph",
      group: "Inline",
      create: <AlterParagraph text="Alternate paragraph text" />,
    },
    { label: "Image",    group: "Media",       create: <ImageBlock /> },
    { label: "Diagram",  group: "Media",       create: <Diagram /> },
    { label: "Audio",    group: "Media",       create: <Audio /> },
    { label: "Template", group: "Interactive", create: <Template /> },
    { label: "Author",   group: "Inline",      create: <Author /> },
    {
      label: "Asset",
      group: "Containers",
      create: (
        <Element is={Asset} canvas>
          <ImageBlock />
          <Author />
        </Element>
      ) as unknown as React.ReactElement,
    },
    {
      label: "Text",
      group: "Containers",
      create: <Element is={TextBlock} canvas /> as unknown as React.ReactElement,
    },
    {
      label: "Quote",
      group: "Containers",
      create: (
        <Element is={Quote} canvas>
          <Element is={TextBlock} canvas>
            <Paragraph text="The quote text goes here." />
          </Element>
          <Author />
        </Element>
      ) as unknown as React.ReactElement,
    },
    {
      label: "Hero",
      group: "Containers",
      create: <Element is={Hero} canvas /> as unknown as React.ReactElement,
    },
    {
      label: "PrimaryBox",
      group: "Containers",
      create: <Element is={PrimaryBox} canvas /> as unknown as React.ReactElement,
    },
    {
      label: "Container",
      group: "Containers",
      create: <Element is={Container} canvas /> as unknown as React.ReactElement,
    },
    {
      label: "Layout (2 cols)",
      group: "Layout",
      create: <Element is={LayoutBlock} columns={2} canvas /> as unknown as React.ReactElement,
    },
    {
      label: "Masonry (3 cols)",
      group: "Layout",
      create: <Element is={Masonry} columns={3} canvas /> as unknown as React.ReactElement,
    },
  ];

  const groups = Array.from(new Set(items.map((i) => i.group)));

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group}>
          <div className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)] mb-2">
            {group}
          </div>
          <div className="space-y-1">
            {items
              .filter((i) => i.group === group)
              .map((item) => (
                <button
                  key={item.label}
                  ref={(ref) => {
                    if (ref) connectors.create(ref, item.create);
                  }}
                  className="w-full text-left px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-secondary)] hover:bg-[var(--color-surface)] cursor-grab active:cursor-grabbing text-sm text-[var(--color-foreground)] transition-colors"
                >
                  {item.label}
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
