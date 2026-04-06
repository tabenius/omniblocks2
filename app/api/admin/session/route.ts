import { NextResponse } from "next/server";
import { getAdminSessionFromCookieHeader } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const session = await getAdminSessionFromCookieHeader(cookieHeader);
  return NextResponse.json({ authenticated: Boolean(session), session });
}

