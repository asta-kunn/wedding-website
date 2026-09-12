import { NextResponse } from "next/server";
import { getDb } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ATTENDANCE = ["hadir", "tidak_hadir", "ragu"] as const;
type Attendance = (typeof ATTENDANCE)[number];

/** POST /api/rsvp — body { slug?, name, attendance, pax?, message? } */
export async function POST(request: Request) {
  let body: { slug?: string; name?: string; attendance?: string; pax?: number; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Isi permintaan tidak valid." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 120);
  if (!name) return NextResponse.json({ error: "Nama wajib diisi." }, { status: 400 });

  const attendance = body.attendance as Attendance | undefined;
  if (!attendance || !ATTENDANCE.includes(attendance)) {
    return NextResponse.json({ error: "Konfirmasi kehadiran tidak valid." }, { status: 400 });
  }

  let guestId: string | null = null;
  if (body.slug) {
    const { data } = await getDb().from("guests").select("id").eq("slug", body.slug).maybeSingle();
    guestId = (data?.id as string | undefined) ?? null;
  }

  const pax = Number(body.pax);
  const { error } = await getDb().from("rsvps").insert({
    guest_id: guestId,
    name,
    attendance,
    pax: Number.isInteger(pax) && pax > 0 && pax < 100 ? pax : null,
    message: body.message?.trim() ? body.message.trim().slice(0, 500) : null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** GET /api/rsvp — daftar ucapan terbaru, hanya field yang aman ditampilkan publik. */
export async function GET() {
  const { data, error } = await getDb()
    .from("rsvps")
    .select("name, attendance, message, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rsvps: data ?? [] });
}
