import { NextResponse } from "next/server";
import { getAdminSessionFromCookieHeader } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const adminSession = await getAdminSessionFromCookieHeader(cookieHeader);

  const session = adminSession
    ? {
        user: {
          id: "admin",
          email: adminSession.email,
          name: adminSession.email,
        },
      }
    : null;

  return NextResponse.json({
    ok: true,
    authenticated: Boolean(session),
    session,
  });
}
