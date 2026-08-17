import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, createSessionToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const pin = process.env.ADMIN_PIN;
  if (!pin) {
    return NextResponse.json({ error: "ADMIN_PIN belum diatur di server." }, { status: 500 });
  }

  let body: { pin?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Isi permintaan tidak valid." }, { status: 400 });
  }

  const submitted = (body.pin ?? "").trim();
  if (submitted !== pin) {
    // Jeda kecil untuk memperlambat percobaan menebak PIN.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return NextResponse.json({ error: "PIN salah." }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
