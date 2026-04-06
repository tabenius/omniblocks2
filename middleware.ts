import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromCookieHeader } from "@/lib/adminAuth";

const PROTECTED_API_PREFIXES = [
  "/api/contacts",
  "/api/email/send",
  "/api/r2/images",
  "/api/r2/object",
  "/api/r2/pages",
];

function isStaticAsset(pathname: string): boolean {
  if (pathname.startsWith("/_next/")) return true;
  if (pathname === "/favicon.ico") return true;
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

function buildUnauthorizedApiResponse(): NextResponse {
  return NextResponse.json(
    { ok: false, error: "Admin login required." },
    { status: 401 },
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }
  const protectedApi = PROTECTED_API_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  if (!protectedApi) return NextResponse.next();

  const cookieHeader = request.headers.get("cookie") || "";
  const session = await getAdminSessionFromCookieHeader(cookieHeader);
  if (session) return NextResponse.next();
  return buildUnauthorizedApiResponse();
}

export const config = {
  matcher: ["/api/:path*"],
};
