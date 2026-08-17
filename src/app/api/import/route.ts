import { NextResponse } from "next/server";
import { getDb } from "@/lib/supabase";
import { normalizePhone } from "@/lib/guest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ROWS = 5000;

type IncomingRow = { name?: unknown; phone?: unknown };

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * POST /api/import
 * body { rows: [{ name, phone }] }
 *
 * Aturan: nomor HP adalah kunci unik. Nomor yang sudah ada di database
 * namanya ditimpa (replace), data kehadiran dan kode undangannya tetap.
 * Nomor ganda di dalam satu file: baris paling bawah yang dipakai.
 */
export async function POST(request: Request) {
  let body: { rows?: IncomingRow[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Isi permintaan tidak valid." }, { status: 400 });
  }

  const rows = Array.isArray(body.rows) ? body.rows : [];
  if (rows.length === 0) {
    return NextResponse.json({ error: "Tidak ada baris untuk diimpor." }, { status: 400 });
  }
  if (rows.length > MAX_ROWS) {
    return NextResponse.json(
      { error: `Maksimal ${MAX_ROWS} baris per impor.` },
      { status: 400 }
    );
  }

  const cleaned = new Map<string, { name: string; phone: string }>();
  const rejected: { row: number; name: string; reason: string }[] = [];
  let duplicateInFile = 0;

  rows.forEach((row, index) => {
    const name = String(row.name ?? "").trim().replace(/\s+/g, " ");
    const phone = normalizePhone(row.phone);

    if (!name) {
      rejected.push({ row: index + 2, name: "—", reason: "Nama kosong" });
      return;
    }
    if (!phone) {
      rejected.push({ row: index + 2, name, reason: "Nomor HP kosong atau tidak valid" });
      return;
    }
    if (cleaned.has(phone)) duplicateInFile += 1;
    cleaned.set(phone, { name: name.slice(0, 120), phone });
  });

  const payload = Array.from(cleaned.values());
  if (payload.length === 0) {
    return NextResponse.json({
      inserted: 0,
      replaced: 0,
      duplicateInFile,
      rejected,
    });
  }

  // Cari nomor yang sudah ada supaya bisa dilaporkan sebagai "diganti".
  const existing = new Set<string>();
  for (const part of chunk(payload.map((row) => row.phone), 300)) {
    const { data, error } = await getDb().from("guests").select("phone").in("phone", part);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    for (const row of data ?? []) existing.add(row.phone as string);
  }

  for (const part of chunk(payload, 500)) {
    const { error } = await getDb().from("guests").upsert(part, { onConflict: "phone" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const replaced = payload.filter((row) => existing.has(row.phone)).length;

  return NextResponse.json({
    inserted: payload.length - replaced,
    replaced,
    duplicateInFile,
    rejected,
  });
}
