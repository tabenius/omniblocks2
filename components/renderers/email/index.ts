import {
  HeadingEmail,
  ParagraphEmail,
  AlterParagraphEmail,
  ImageEmail,
  AuthorEmail,
  DiagramEmail,
  AudioEmail,
  TemplateEmail,
} from "./atoms";
import {
  ContainerEmail,
  TextBlockEmail,
  HeroEmail,
  PrimaryBoxEmail,
  QuoteEmail,
  AssetEmail,
} from "./containers";
import { LayoutBlockEmail, MasonryEmail } from "./layouts";

export const emailResolver: Record<
  string,
  React.ComponentType<Record<string, unknown> & { children?: React.ReactNode }>
> = {
  Heading: HeadingEmail,
  Paragraph: ParagraphEmail,
  AlterParagraph: AlterParagraphEmail,
  ImageBlock: ImageEmail,
  Author: AuthorEmail,
  Diagram: DiagramEmail,
  Audio: AudioEmail,
  Template: TemplateEmail,
  Container: ContainerEmail,
  TextBlock: TextBlockEmail,
  Hero: HeroEmail,
  PrimaryBox: PrimaryBoxEmail,
  Quote: QuoteEmail,
  Asset: AssetEmail,
  LayoutBlock: LayoutBlockEmail,
  Masonry: MasonryEmail,
} as Record<
  string,
  React.ComponentType<Record<string, unknown> & { children?: React.ReactNode }>
>;
