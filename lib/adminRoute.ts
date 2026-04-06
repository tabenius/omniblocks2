import { NextResponse } from "next/server";
import { getAdminSessionFromCookieHeader, type AdminSession } from "@/lib/adminAuth";

export function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "Admin login required." },
    { status: 401 },
  );
}

export async function getAdminSession(request: Request): Promise<AdminSession | null> {
  return getAdminSessionFromCookieHeader(request.headers.get("cookie") || "");
}

export async function requireAdmin(request: Request): Promise<
  | { session: AdminSession }
  | { error: NextResponse }
> {
  const session = await getAdminSession(request);
  if (!session) return { error: unauthorized() };
  return { session };
}

