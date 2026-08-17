import { NextResponse } from "next/server";
import { getDb, type GiftType, type Guest } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GIFT_TYPES: GiftType[] = ["amplop", "transfer", "tidak_ada"];

/**
 * POST /api/checkin
 * body { id | code, pax, gift_type, note?, by? }
 */
export async function POST(request: Request) {
  let body: {
    id?: string;
    code?: string;
    pax?: number;
    gift_type?: string;
    note?: string;
    by?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Isi permintaan tidak valid." }, { status: 400 });
  }

  const pax = Number(body.pax);
  if (!Number.isInteger(pax) || pax < 1 || pax > 99) {
    return NextResponse.json({ error: "Jumlah tamu harus 1–99." }, { status: 400 });
  }

  const gift = body.gift_type as GiftType | undefined;
  if (!gift || !GIFT_TYPES.includes(gift)) {
    return NextResponse.json({ error: "Pilih amplop, transfer, atau tidak ada." }, { status: 400 });
  }

  const patch = {
    attended: true,
    pax,
    gift_type: gift,
    note: body.note?.trim() ? body.note.trim().slice(0, 300) : null,
    checked_in_at: new Date().toISOString(),
    checked_in_by: body.by?.trim() ? body.by.trim().slice(0, 60) : null,
  };

  const query = getDb().from("guests").update(patch);
  const filtered = body.id ? query.eq("id", body.id) : query.eq("code", (body.code ?? "").toUpperCase());

  const { data, error } = await filtered.select().maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Tamu tidak ditemukan." }, { status: 404 });

  return NextResponse.json({ guest: data as Guest });
}
