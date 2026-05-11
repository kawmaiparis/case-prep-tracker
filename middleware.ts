import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PREFIXES = ["/gate", "/about", "/api/gate", "/auth", "/login"];

function isPublic(pathname: string) {
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

async function computeToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`demo_access_v1:${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hasValidDemoCookie(request: NextRequest): Promise<boolean> {
  const password = process.env.DEMO_ACCESS_PASSWORD;
  if (!password) return false;
  const cookie = request.cookies.get("demo_access");
  if (!cookie) return false;
  const expected = await computeToken(password);
  return cookie.value === expected;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isPublic(pathname)) {
    // Still run Supabase session refresh on auth/login routes
    if (pathname.startsWith("/auth") || pathname.startsWith("/login")) {
      const { supabaseResponse } = await updateSession(request);
      return supabaseResponse;
    }
    return NextResponse.next();
  }

  // Check Supabase owner session first (cheaper path for authenticated owner)
  const { supabaseResponse, user } = await updateSession(request);
  if (user) return supabaseResponse;

  // Check demo cookie
  if (await hasValidDemoCookie(request)) return supabaseResponse;

  // No valid auth — redirect to gate
  const url = request.nextUrl.clone();
  url.pathname = "/gate";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
