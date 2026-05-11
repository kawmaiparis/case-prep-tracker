import { NextRequest, NextResponse } from "next/server";

async function computeToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`demo_access_v1:${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { password } = body as { password?: string };
  const expected = process.env.DEMO_ACCESS_PASSWORD;

  if (!expected || !password || password !== expected) {
    return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
  }

  const token = await computeToken(expected);

  const response = NextResponse.json({ ok: true });
  response.cookies.set("demo_access", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}
