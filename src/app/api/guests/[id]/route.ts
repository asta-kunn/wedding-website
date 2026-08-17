import { NextResponse } from "next/server";
import { getDb } from "@/lib/supabase";
import { normalizePhone } from "@/lib/guest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

/**
 * PATCH /api/guests/:id
 * body { action: "reset" }              -> batalkan kehadiran
 * body { name?, phone? }                -> perbaiki data tamu
 */
export async function PATCH(request: Request, { params }: Params) {
  let body: { action?: string; name?: string; phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Isi permintaan tidak valid." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};

  if (body.action === "reset") {
    patch.attended = false;
    patch.pax = null;
    patch.gift_type = null;
    patch.note = null;
    patch.checked_in_at = null;
    patch.checked_in_by = null;
  }

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: "Nama tidak boleh kosong." }, { status: 400 });
    patch.name = name;
  }

  if (typeof body.phone === "string") {
    const phone = normalizePhone(body.phone);
    if (!phone) return NextResponse.json({ error: "Nomor HP tidak valid." }, { status: 400 });
    patch.phone = phone;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan yang dikirim." }, { status: 400 });
  }

  const { data, error } = await getDb()
    .from("guests")
    .update(patch)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    const status = error.code === "23505" ? 409 : 500;
    const message =
      error.code === "23505" ? "Nomor HP sudah dipakai tamu lain." : error.message;
    return NextResponse.json({ error: message }, { status });
  }

  return NextResponse.json({ guest: data });
}

/** DELETE /api/guests/:id */
export async function DELETE(_request: Request, { params }: Params) {
  const { error } = await getDb().from("guests").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
