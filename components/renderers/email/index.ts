import {
  HeadingEmail,
  ParagraphEmail,
  AlterParagraphEmail,
  ImageEmail,
  AuthorEmail,
  DiagramEmail,
  AudioEmail,
  VideoEmail,
  TemplateEmail,
  EventEmail,
  NameEmail,
  EmailEmail,
  TextareaEmail,
  ButtonEmail,
  LinkExtendedEmail,
} from "./atoms";
import {
  ContainerEmail,
  TextBlockEmail,
  HeroEmail,
  PrimaryBoxEmail,
  QuoteEmail,
  AssetEmail,
  FormEmail,
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
  Video: VideoEmail,
  Event: EventEmail,
  Template: TemplateEmail,
  Name: NameEmail,
  Email: EmailEmail,
  Textarea: TextareaEmail,
  Button: ButtonEmail,
  LinkExtended: LinkExtendedEmail,
  Container: ContainerEmail,
  TextBlock: TextBlockEmail,
  Form: FormEmail,
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
