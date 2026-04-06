import { NextResponse } from "next/server";
import {
  createAdminSessionCookie,
  createAdminSessionToken,
  isAdminCredentialsConfigured,
  validateAdminCredentials,
} from "@/lib/adminAuth";

type LoginBody = {
  email?: unknown;
  username?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  try {
    if (!isAdminCredentialsConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Admin login is not configured." },
        { status: 400 },
      );
    }

    const body = (await request.json()) as LoginBody;
    const emailRaw =
      typeof body?.email === "string"
        ? body.email
        : typeof body?.username === "string"
          ? body.username
          : "";
    const email = emailRaw.trim().toLowerCase();
    const password = typeof body?.password === "string" ? body.password : "";

    if (!(await validateAdminCredentials(email, password))) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials." },
        { status: 401 },
      );
    }

    const token = await createAdminSessionToken(email);
    const response = NextResponse.json({ ok: true });
    response.headers.append("Set-Cookie", createAdminSessionCookie(token));
    return response;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to sign in." },
      { status: 400 },
    );
  }
}

