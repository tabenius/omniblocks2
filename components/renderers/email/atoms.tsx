import * as React from "react";
import { Heading as REHeading, Text as REText, Img, Link } from "@react-email/components";
import { encode } from "html-entities";
import type { HeadingProps, HeadingLevel } from "@/components/user/Heading";
import type { ParagraphProps } from "@/components/user/Paragraph";
import type { AlterParagraphProps } from "@/components/user/AlterParagraph";
import type { ImageBlockProps } from "@/components/user/ImageBlock";
import type { AuthorProps } from "@/components/user/Author";
import type { DiagramProps } from "@/components/user/Diagram";
import type { AudioProps } from "@/components/user/Audio";
import type { TemplateProps } from "@/components/user/Template";

const emailSize: Record<HeadingLevel, string> = {
  1: "32px",
  2: "26px",
  3: "22px",
  4: "18px",
  5: "16px",
  6: "14px",
};

export const HeadingEmail = (p: HeadingProps) => (
  <REHeading
    as={`h${p.level ?? 1}` as "h1"}
    style={{
      fontSize: emailSize[(p.level ?? 1) as HeadingLevel],
      fontWeight: 700,
      color: p.color ?? "#0f172a",
      textAlign: p.textAlign ?? "left",
      margin: "0 0 12px 0",
      fontFamily: "Arial, Helvetica, sans-serif",
    }}
  >
    {encode(p.text ?? "")}
  </REHeading>
);

export const ParagraphEmail = (p: ParagraphProps) => (
  <REText
    style={{
      fontSize: p.fontSize ?? "16px",
      color: p.color ?? "#475569",
      textAlign: p.textAlign ?? "left",
      margin: "0 0 12px 0",
      lineHeight: "1.5",
      fontFamily: "Arial, Helvetica, sans-serif",
    }}
  >
    {encode(p.text ?? "")}
  </REText>
);

export const AlterParagraphEmail = (p: AlterParagraphProps) => (
  <REText
    style={{
      fontSize: p.fontSize ?? "16px",
      color: p.color ?? "#475569",
      textAlign: p.textAlign ?? "left",
      fontStyle: p.fontStyle ?? "italic",
      margin: "0 0 12px 0",
      lineHeight: "1.5",
      fontFamily: "Georgia, 'Times New Roman', serif",
    }}
  >
    {encode(p.text ?? "")}
  </REText>
);

export const ImageEmail = (p: ImageBlockProps) => {
  const align = p.align ?? "center";
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      width="100%"
      style={{ borderCollapse: "collapse" }}
    >
      <tbody>
        <tr>
          <td align={align}>
            <Img
              src={p.src ?? ""}
              alt={p.alt ?? ""}
              width={p.maxWidth?.replace("px", "") ?? "800"}
              style={{
                display: "block",
                maxWidth: p.maxWidth ?? "800px",
                width: "100%",
                height: "auto",
                borderRadius: p.borderRadius ?? "0px",
              }}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export const DiagramEmail = (p: DiagramProps) => (
  <table
    role="presentation"
    cellPadding={0}
    cellSpacing={0}
    border={0}
    width="100%"
    style={{ borderCollapse: "collapse" }}
  >
    <tbody>
      <tr>
        <td
          style={{
            background: "#f8fafc",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <pre
            style={{
              margin: 0,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "12px",
              color: "#0f172a",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {encode(p.source ?? "")}
          </pre>
        </td>
      </tr>
    </tbody>
  </table>
);

export const TemplateEmail = (p: TemplateProps) => (
  <table
    role="presentation"
    cellPadding={0}
    cellSpacing={0}
    border={0}
    width="100%"
    style={{ borderCollapse: "collapse" }}
  >
    <tbody>
      <tr>
        <td
          style={{
            background: "#f8fafc",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#64748b",
              marginBottom: "6px",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            Interactive (htmx)
          </div>
          <pre
            style={{
              margin: 0,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "11px",
              color: "#0f172a",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {encode(p.template ?? "")}
          </pre>
        </td>
      </tr>
    </tbody>
  </table>
);

export const AudioEmail = (p: AudioProps) => (
  <table
    role="presentation"
    cellPadding={0}
    cellSpacing={0}
    border={0}
    width="100%"
    style={{ borderCollapse: "collapse" }}
  >
    <tbody>
      <tr>
        <td
          style={{
            background: "#f1f5f9",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#0f172a",
              marginBottom: "4px",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            {encode(p.title ?? "Audio")}
          </div>
          <Link
            href={p.src ?? "#"}
            style={{
              fontSize: "13px",
              color: "#2563eb",
              textDecoration: "underline",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            ▶ Listen
          </Link>
        </td>
      </tr>
    </tbody>
  </table>
);

export const AuthorEmail = (p: AuthorProps) => (
  <table
    role="presentation"
    cellPadding={0}
    cellSpacing={0}
    border={0}
    style={{ borderCollapse: "collapse" }}
  >
    <tbody>
      <tr>
        <td style={{ paddingRight: "8px", verticalAlign: "middle" }}>
          <Img
            src={p.avatar ?? ""}
            alt={encode(p.name ?? "")}
            width={(p.avatarSize ?? "32px").replace("px", "")}
            height={(p.avatarSize ?? "32px").replace("px", "")}
            style={{
              borderRadius: "9999px",
              display: "block",
            }}
          />
        </td>
        <td style={{ verticalAlign: "middle" }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#0f172a",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            {encode(p.name ?? "")}
          </div>
          {p.showEmail !== false && p.email && (
            <Link
              href={`mailto:${p.email}`}
              style={{
                fontSize: "12px",
                color: "#64748b",
                textDecoration: "none",
                fontFamily: "Arial, Helvetica, sans-serif",
              }}
            >
              {encode(p.email)}
            </Link>
          )}
        </td>
      </tr>
    </tbody>
  </table>
);
