const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  notes?: unknown;
};

function jsonResponse(payload: unknown, init?: ResponseInit): Response {
  return Response.json(payload, init);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseBody(value: unknown): ContactPayload {
  if (!value || typeof value !== "object") return {};
  return value as ContactPayload;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function resolveFromAddress(): string {
  return (
    process.env.RESEND_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    ""
  )
    .split(",")[0]
    ?.trim() || "";
}

function resolveContactTarget(): string {
  const adminEmail = (process.env.ADMIN_EMAILS || "").split(",")[0]?.trim() || "";
  return (
    process.env.CONTACT_EMAIL ||
    process.env.SUPPORT_EMAIL ||
    process.env.RESEND_TO ||
    adminEmail
  )
    .split(",")[0]
    ?.trim() || "";
}

export async function POST(request: Request) {
  let rawBody: unknown = {};
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      rawBody = await request.json();
    } else {
      const form = await request.formData();
      rawBody = Object.fromEntries(form.entries());
    }
  } catch {
    return jsonResponse({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const body = parseBody(rawBody);
  const name = asString(body.name);
  const email = normalizeEmail(asString(body.email));
  const message = asString(body.message || body.notes);

  if (name.length < 2) {
    return jsonResponse(
      { ok: false, error: "Name must be at least 2 characters." },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return jsonResponse({ ok: false, error: "Enter a valid email." }, { status: 400 });
  }
  if (message.length < 4) {
    return jsonResponse(
      { ok: false, error: "Notes must be at least 4 characters." },
      { status: 400 },
    );
  }

  const resendKey = process.env.RESEND_API_KEY || "";
  const from = resolveFromAddress();
  const to = resolveContactTarget();
  if (!resendKey || !from || !to) {
    return jsonResponse(
      {
        ok: false,
        error: "Contact email is not configured yet.",
      },
      { status: 500 },
    );
  }

  const subject = `Omniland contact: ${name}`;
  const text = `Name: ${name}\nEmail: ${email}\n\n${message}`;

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        reply_to: email,
        text,
      }),
    });
  } catch {
    return jsonResponse(
      { ok: false, error: "Could not reach email provider." },
      { status: 502 },
    );
  }

  let resendJson: unknown = null;
  try {
    resendJson = await response.json();
  } catch {
    resendJson = null;
  }

  if (!response.ok) {
    return jsonResponse(
      { ok: false, error: "Email provider rejected the message.", details: resendJson },
      { status: 502 },
    );
  }

  return jsonResponse({
    ok: true,
    message: "Message sent. We will get back to you shortly.",
  });
}
