import { NextResponse } from "next/server";
import { getDb, type Guest } from "@/lib/supabase";
import { normalizePhone } from "@/lib/guest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildStats(rows: Guest[]) {
  const stats = {
    total: rows.length,
    hadir: 0,
    belum: 0,
    pax: 0,
    amplop: 0,
    transfer: 0,
    tidak_ada: 0,
  };
  for (const row of rows) {
    if (row.attended) {
      stats.hadir += 1;
      stats.pax += row.pax ?? 0;
      if (row.gift_type === "amplop") stats.amplop += 1;
      if (row.gift_type === "transfer") stats.transfer += 1;
      if (row.gift_type === "tidak_ada") stats.tidak_ada += 1;
    } else {
      stats.belum += 1;
    }
  }
  return stats;
}

/** GET /api/guests?q=budi&status=hadir|belum */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const status = url.searchParams.get("status");

  const { data, error } = await getDb()
    .from("guests")
    .select("*")
    .order("created_at", { ascending: true })
    .range(0, 4999); // lewati batas 1000 baris bawaan Supabase

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const all = (data ?? []) as Guest[];
  const stats = buildStats(all);

  let rows = all;
  if (status === "hadir") rows = rows.filter((row) => row.attended);
  if (status === "belum") rows = rows.filter((row) => !row.attended);

  if (q) {
    const needle = q.toLowerCase();
    const digits = q.replace(/\D/g, "");
    rows = rows.filter(
      (row) =>
        row.name.toLowerCase().includes(needle) ||
        row.code.toLowerCase().includes(needle) ||
        (digits.length >= 3 && row.phone.includes(digits))
    );
  }

  return NextResponse.json({ guests: rows, stats });
}

/** POST /api/guests — tambah satu tamu manual. Nomor sama akan menimpa nama lama. */
export async function POST(request: Request) {
  let body: { name?: string; phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Isi permintaan tidak valid." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const phone = normalizePhone(body.phone);

  if (!name) return NextResponse.json({ error: "Nama wajib diisi." }, { status: 400 });
  if (!phone) return NextResponse.json({ error: "Nomor HP tidak valid." }, { status: 400 });

  const { data, error } = await getDb()
    .from("guests")
    .upsert({ name, phone }, { onConflict: "phone" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ guest: data });
}
