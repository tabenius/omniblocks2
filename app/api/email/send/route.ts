import { sanitizeExportName, splitEmailList, splitFromAddresses } from "@/lib/emailAddress";

export const runtime = "edge";

function jsonResponse(payload: unknown, init?: ResponseInit): Response {
  return Response.json(payload, init);
}

type SendMode = "attach-web-html" | "attach-sources" | "inline-email-html";

type SendPayload = {
  from?: string;
  to?: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  mode?: SendMode;
  textBody?: string;
  webHtml?: string;
  emailHtml?: string;
  craftJson?: string;
  blockSource?: string;
  filenameBase?: string;
};

function resolveFromAddresses(): string[] {
  const raw =
    process.env.RESEND_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    "";
  return splitFromAddresses(raw);
}

function toBase64Utf8(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function parseBody(value: unknown): SendPayload {
  if (!value || typeof value !== "object") return {};
  return value as SendPayload;
}

function isSendMode(value: unknown): value is SendMode {
  return (
    value === "attach-web-html" ||
    value === "attach-sources" ||
    value === "inline-email-html"
  );
}

export async function GET() {
  const fromAddresses = resolveFromAddresses();
  const configured = Boolean(process.env.RESEND_API_KEY && fromAddresses.length > 0);
  return jsonResponse({ fromAddresses, configured });
}

export async function POST(request: Request) {
  const resendKey = process.env.RESEND_API_KEY || "";
  const configuredFrom = resolveFromAddresses();
  if (!resendKey) {
    return jsonResponse(
      { error: "Missing RESEND_API_KEY." },
      { status: 500 },
    );
  }
  if (configuredFrom.length === 0) {
    return jsonResponse(
      { error: "No sender configured. Set RESEND_FROM or RESEND_FROM_EMAIL." },
      { status: 500 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 });
  }

  const body = parseBody(json);
  const to = splitEmailList(body.to || "");
  const cc = splitEmailList(body.cc || "");
  const bcc = splitEmailList(body.bcc || "");
  const from = body.from?.trim() || configuredFrom[0];
  const subject = body.subject?.trim() || "OmniBlocks export";
  const mode = body.mode;
  const webHtml = body.webHtml || "";
  const emailHtml = body.emailHtml || "";
  const craftJson = body.craftJson || "";
  const blockSource = body.blockSource || "";
  const textBody = body.textBody || "";
  const filenameBase = sanitizeExportName(body.filenameBase || "document");

  if (!isSendMode(mode)) {
    return jsonResponse({ error: "Invalid send mode." }, { status: 400 });
  }
  if (!configuredFrom.includes(from)) {
    return jsonResponse(
      { error: "From address is not allowed by RESEND_FROM configuration." },
      { status: 400 },
    );
  }
  if (to.length === 0) {
    return jsonResponse(
      { error: "At least one valid recipient is required in To." },
      { status: 400 },
    );
  }
  if (mode === "attach-web-html" && !webHtml.trim()) {
    return jsonResponse(
      { error: "Web HTML payload is empty." },
      { status: 400 },
    );
  }
  if (mode === "inline-email-html" && !emailHtml.trim()) {
    return jsonResponse(
      { error: "Email HTML payload is empty." },
      { status: 400 },
    );
  }
  if (mode === "attach-sources" && (!blockSource.trim() || !craftJson.trim())) {
    return jsonResponse(
      { error: "Block source or Craft JSON payload is empty." },
      { status: 400 },
    );
  }

  const resendPayload: Record<string, unknown> = {
    from,
    to,
    subject,
  };
  if (cc.length > 0) resendPayload.cc = cc;
  if (bcc.length > 0) resendPayload.bcc = bcc;

  if (mode === "attach-web-html") {
    resendPayload.html =
      "<p>Your OmniBlocks static web HTML export is attached to this email.</p>";
    resendPayload.text =
      textBody.trim() || "Your OmniBlocks static web HTML export is attached.";
    resendPayload.attachments = [
      {
        filename: `${filenameBase}.html`,
        content: toBase64Utf8(webHtml),
      },
    ];
  } else if (mode === "attach-sources") {
    resendPayload.text =
      textBody.trim() || "Attached: HTMX block language source and Craft.js JSON.";
    resendPayload.attachments = [
      {
        filename: `${filenameBase}.blocks.txt`,
        content: toBase64Utf8(blockSource),
      },
      {
        filename: `${filenameBase}.craft.json`,
        content: toBase64Utf8(craftJson),
      },
    ];
  } else {
    resendPayload.html = emailHtml;
    resendPayload.text = textBody.trim() || "HTML email generated from OmniBlocks.";
  }

  let resendResponse: Response;
  try {
    resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
    });
  } catch {
    return jsonResponse(
      { error: "Failed to reach Resend API." },
      { status: 502 },
    );
  }

  let resendJson: unknown = null;
  try {
    resendJson = await resendResponse.json();
  } catch {
    resendJson = null;
  }

  if (!resendResponse.ok) {
    return jsonResponse(
      {
        error: "Resend API returned an error.",
        details: resendJson,
      },
      { status: 502 },
    );
  }

  return jsonResponse({
    ok: true,
    mode,
    response: resendJson,
  });
}
