import { getDb, type Guest } from "@/lib/supabase";
import { GIFT_LABEL } from "@/lib/guest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

/** GET /api/export — CSV rekap seluruh tamu, siap dibuka di Excel. */
export async function GET() {
  const { data, error } = await getDb()
    .from("guests")
    .select("*")
    .order("created_at", { ascending: true })
    .range(0, 4999);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const header = [
    "kode",
    "nama",
    "no_hp",
    "hadir",
    "jumlah_orang",
    "hadiah",
    "catatan",
    "waktu_check_in",
    "petugas",
  ];

  const lines = [header.join(",")];

  for (const guest of (data ?? []) as Guest[]) {
    lines.push(
      [
        csvCell(guest.code),
        csvCell(guest.name),
        csvCell("'" + guest.phone),
        csvCell(guest.attended ? "Hadir" : "Belum"),
        csvCell(guest.pax ?? ""),
        csvCell(guest.gift_type ? GIFT_LABEL[guest.gift_type] : ""),
        csvCell(guest.note ?? ""),
        csvCell(
          guest.checked_in_at
            ? new Date(guest.checked_in_at).toLocaleString("id-ID", { hour12: false })
            : ""
        ),
        csvCell(guest.checked_in_by ?? ""),
      ].join(",")
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);

  // BOM supaya huruf beraksen tampil benar di Excel.
  return new Response("\uFEFF" + lines.join("\r\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="kehadiran-${stamp}.csv"`,
    },
  });
}
