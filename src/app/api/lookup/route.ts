import { NextResponse } from "next/server";
import { getDb, type Guest } from "@/lib/supabase";
import { extractCode, normalizePhone } from "@/lib/guest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/lookup?raw=<isi QR>
 * Mencari tamu berdasarkan kode undangan. Kalau tidak ketemu, dicoba
 * sebagai nomor HP, lalu sebagai potongan nama (untuk input manual).
 */
export async function GET(request: Request) {
  const raw = (new URL(request.url).searchParams.get("raw") ?? "").trim();
  if (!raw) return NextResponse.json({ error: "Isi QR kosong." }, { status: 400 });

  const code = extractCode(raw);

  if (code) {
    const { data, error } = await getDb().from("guests").select("*").eq("code", code).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (data) return NextResponse.json({ guest: data as Guest, matchedBy: "code", code });
  }

  const phone = normalizePhone(raw);
  if (phone) {
    const { data } = await getDb().from("guests").select("*").eq("phone", phone).maybeSingle();
    if (data) return NextResponse.json({ guest: data as Guest, matchedBy: "phone", code });
  }

  if (raw.length >= 3) {
    const { data } = await getDb()
      .from("guests")
      .select("*")
      .ilike("name", `%${raw}%`)
      .order("name", { ascending: true })
      .limit(8);

    const matches = (data ?? []) as Guest[];
    if (matches.length === 1) {
      return NextResponse.json({ guest: matches[0], matchedBy: "name", code });
    }
    if (matches.length > 1) {
      return NextResponse.json({ candidates: matches, matchedBy: "name", code });
    }
  }

  return NextResponse.json(
    { error: "Tamu tidak ditemukan.", code: code ?? raw },
    { status: 404 }
  );
}
