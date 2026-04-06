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
import type { EventProps } from "@/components/user/Event";
import type { VideoProps } from "@/components/user/Video";
import type { NameProps } from "@/components/user/Name";
import type { EmailProps } from "@/components/user/Email";
import type { TextareaProps } from "@/components/user/Textarea";
import type { ButtonProps } from "@/components/user/Button";

const emailSize: Record<HeadingLevel, string> = {
  1: "32px",
  2: "26px",
  3: "22px",
  4: "18px",
  5: "16px",
  6: "14px",
};

function eventDateParts(input?: string): {
  month: string;
  day: string;
  year: string;
  raw: string;
} {
  const raw = (input ?? "").trim();
  if (!raw) return { month: "DATE", day: "--", year: "", raw: "" };
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      month: parsed.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      day: String(parsed.getDate()).padStart(2, "0"),
      year: String(parsed.getFullYear()),
      raw,
    };
  }
  return { month: "DATE", day: raw, year: "", raw };
}

export const HeadingEmail = (p: HeadingProps) => (
  <REHeading
    as={`h${p.level ?? 1}` as "h1"}
    style={{
      fontSize: emailSize[(p.level ?? 1) as HeadingLevel],
      fontWeight: 700,
      color: p.color ?? "#0f172a",
      textAlign: p.textAlign ?? "left",
      background: "transparent",
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

export const NameEmail = (p: NameProps) => (
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
            fontSize: "12px",
            color: "#64748b",
            paddingBottom: "6px",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {encode((p.label ?? "Name") + (p.required ? " *" : ""))}
        </td>
      </tr>
      <tr>
        <td
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "10px 12px",
            fontSize: "14px",
            color: "#94a3b8",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {encode(p.placeholder ?? "Your name")}
        </td>
      </tr>
    </tbody>
  </table>
);

export const EmailEmail = (p: EmailProps) => (
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
            fontSize: "12px",
            color: "#64748b",
            paddingBottom: "6px",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {encode((p.label ?? "Email") + (p.required ? " *" : ""))}
        </td>
      </tr>
      <tr>
        <td
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "10px 12px",
            fontSize: "14px",
            color: "#94a3b8",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {encode(p.placeholder ?? "you@example.com")}
        </td>
      </tr>
    </tbody>
  </table>
);

export const TextareaEmail = (p: TextareaProps) => (
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
            fontSize: "12px",
            color: "#64748b",
            paddingBottom: "6px",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {encode((p.label ?? "Message") + (p.required ? " *" : ""))}
        </td>
      </tr>
      <tr>
        <td
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "10px 12px",
            fontSize: "14px",
            color: "#94a3b8",
            minHeight: `${Math.max(3, p.rows ?? 5) * 18}px`,
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {encode(p.placeholder ?? "Write your message")}
        </td>
      </tr>
    </tbody>
  </table>
);

export const ButtonEmail = (p: ButtonProps) => (
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
        <td align={p.align ?? "left"}>
          <span
            style={{
              display: "inline-block",
              background: p.background ?? "#2563eb",
              color: p.color ?? "#ffffff",
              border: `1px solid ${p.borderColor ?? "#2563eb"}`,
              borderRadius: p.borderRadius ?? "8px",
              padding: `${p.paddingY ?? "8px"} ${p.paddingX ?? "16px"}`,
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            {encode(p.text ?? "Submit")}
          </span>
        </td>
      </tr>
    </tbody>
  </table>
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

export const VideoEmail = (p: VideoProps) => (
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
            {encode(p.title ?? "Video")}
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
            ▶ Open Video
          </Link>
        </td>
      </tr>
    </tbody>
  </table>
);

export const EventEmail = (p: EventProps) => {
  const from = eventDateParts(p.from);
  const to = eventDateParts(p.to);
  const hasTo = (p.to ?? "").trim().length > 0;
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
          <td
            valign="top"
            style={{
              width: "34%",
              background: p.dateBackground ?? "#f1f5f9",
              color: p.dateColor ?? "#0f172a",
              borderRadius: "8px",
              padding: "10px",
              textAlign: "center",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: "10px", letterSpacing: "0.08em", fontFamily: "Arial, Helvetica, sans-serif" }}>
              {encode(from.month)}
            </div>
            <div style={{ fontSize: "38px", lineHeight: "1", fontWeight: 700, fontFamily: "Arial, Helvetica, sans-serif" }}>
              {encode(from.day)}
            </div>
            <div style={{ fontSize: "11px", fontFamily: "Arial, Helvetica, sans-serif" }}>{encode(from.year)}</div>
            {hasTo ? (
              <div style={{ marginTop: "6px", fontSize: "10px", fontFamily: "Arial, Helvetica, sans-serif" }}>
                {encode(`to ${to.raw || p.to || ""}`)}
              </div>
            ) : null}
          </td>
          <td style={{ width: "66%", paddingLeft: "12px", verticalAlign: "top" }}>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "6px", fontFamily: "Arial, Helvetica, sans-serif" }}>
              {encode(p.title ?? "Event title")}
            </div>
            <div style={{ fontSize: "14px", lineHeight: "1.45", color: "#475569", fontFamily: "Arial, Helvetica, sans-serif" }}>
              {encode(p.text ?? "Event description paragraph")}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

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
