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
import { Event } from "@/components/user/Event";
import { Video } from "@/components/user/Video";
import { Form } from "@/components/user/Form";
import { ContactForm } from "@/components/user/ContactForm";
import { Name } from "@/components/user/Name";
import { Email } from "@/components/user/Email";
import { Textarea } from "@/components/user/Textarea";
import { Button } from "@/components/user/Button";
import { LinkExtended } from "@/components/user/LinkExtended";

export const Toolbox = () => {
  const { connectors } = useEditor();

  const items: Array<{
    label: string;
    group: string;
    create: React.ReactElement;
    parentHint: string;
  }> = [
    {
      label: "H1",
      group: "Inline",
      create: <Heading text="Heading 1" level={1} />,
      parentHint: "Container, Text, Hero, PrimaryBox, Form",
    },
    {
      label: "H2",
      group: "Inline",
      create: <Heading text="Heading 2" level={2} />,
      parentHint: "Container, Text, Hero, PrimaryBox, Form",
    },
    {
      label: "H3",
      group: "Inline",
      create: <Heading text="Heading 3" level={3} />,
      parentHint: "Container, Text, Hero, PrimaryBox, Form",
    },
    {
      label: "Paragraph",
      group: "Inline",
      create: <Paragraph text="Paragraph text" />,
      parentHint: "Container, Text, Hero, PrimaryBox, Form",
    },
    {
      label: "AlterParagraph",
      group: "Inline",
      create: <AlterParagraph text="Alternate paragraph text" />,
      parentHint: "Container, Text, Hero, PrimaryBox, Form",
    },
    {
      label: "Image",
      group: "Media",
      create: <ImageBlock />,
      parentHint: "Container, Text, Hero, PrimaryBox",
    },
    {
      label: "Diagram",
      group: "Media",
      create: <Diagram />,
      parentHint: "Container, Hero, PrimaryBox",
    },
    {
      label: "Audio",
      group: "Media",
      create: <Audio />,
      parentHint: "Container, Hero, PrimaryBox, Asset",
    },
    {
      label: "Video",
      group: "Media",
      create: <Video />,
      parentHint: "Container, Hero, PrimaryBox",
    },
    {
      label: "Event",
      group: "Inline",
      create: <Event />,
      parentHint: "Container, Hero, PrimaryBox",
    },
    {
      label: "Template",
      group: "Interactive",
      create: <Template />,
      parentHint: "Container, Hero, PrimaryBox",
    },
    {
      label: "Button",
      group: "Interactive",
      create: <Button />,
      parentHint: "Container, Text, Hero, PrimaryBox, Form",
    },
    {
      label: "LinkExtended",
      group: "Interactive",
      create: <LinkExtended />,
      parentHint: "Container, Text, Hero, PrimaryBox",
    },
    { label: "Name", group: "Interactive", create: <Name />, parentHint: "Form" },
    { label: "Email", group: "Interactive", create: <Email />, parentHint: "Form" },
    { label: "Textarea", group: "Interactive", create: <Textarea />, parentHint: "Form" },
    {
      label: "Form",
      group: "Interactive",
      create: (
        <Element is={Form} canvas>
          <Name />
          <Email />
          <Textarea />
          <Button text="Submit" buttonType="submit" />
        </Element>
      ) as unknown as React.ReactElement,
      parentHint: "Container, Hero, PrimaryBox",
    },
    {
      label: "ContactForm",
      group: "Interactive",
      create: <ContactForm />,
      parentHint: "Container, Hero, PrimaryBox, Text",
    },
    {
      label: "Author",
      group: "Inline",
      create: <Author />,
      parentHint: "Container, Hero, PrimaryBox, Asset, Quote",
    },
    {
      label: "Asset",
      group: "Containers",
      create: (
        <Element is={Asset} canvas>
          <ImageBlock />
          <Author />
        </Element>
      ) as unknown as React.ReactElement,
      parentHint: "Container, Hero, PrimaryBox",
    },
    {
      label: "Text",
      group: "Containers",
      create: <Element is={TextBlock} canvas /> as unknown as React.ReactElement,
      parentHint: "Container, Hero, PrimaryBox, Quote",
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
      parentHint: "Container, Hero, PrimaryBox",
    },
    {
      label: "Hero",
      group: "Containers",
      create: <Element is={Hero} canvas /> as unknown as React.ReactElement,
      parentHint: "Container, PrimaryBox",
    },
    {
      label: "PrimaryBox",
      group: "Containers",
      create: <Element is={PrimaryBox} canvas /> as unknown as React.ReactElement,
      parentHint: "Container, Hero, PrimaryBox",
    },
    {
      label: "Container",
      group: "Containers",
      create: <Element is={Container} canvas /> as unknown as React.ReactElement,
      parentHint: "Container, Hero, PrimaryBox, LayoutBlock",
    },
    {
      label: "Layout (2 cols)",
      group: "Layout",
      create: <Element is={LayoutBlock} columns={2} canvas /> as unknown as React.ReactElement,
      parentHint: "Container, Hero, PrimaryBox",
    },
    {
      label: "Masonry (3 cols)",
      group: "Layout",
      create: <Element is={Masonry} columns={3} canvas /> as unknown as React.ReactElement,
      parentHint: "Container, Hero, PrimaryBox",
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
                  title={`Parent blocks: ${item.parentHint}`}
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
