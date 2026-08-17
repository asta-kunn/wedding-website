export type GiftType = "amplop" | "transfer" | "tidak_ada";

export type Guest = {
  id: string;
  code: string;
  name: string;
  phone: string;
  attended: boolean;
  pax: number | null;
  gift_type: GiftType | null;
  note: string | null;
  checked_in_at: string | null;
  checked_in_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Stats = {
  total: number;
  hadir: number;
  belum: number;
  pax: number;
  amplop: number;
  transfer: number;
  tidak_ada: number;
};

export const GIFT_LABEL: Record<GiftType, string> = {
  amplop: "Amplop",
  transfer: "Transfer",
  tidak_ada: "Tidak ada",
};

/**
 * Menyeragamkan nomor HP Indonesia menjadi format 62xxxxxxxxxx.
 * Mengembalikan null kalau nomor tidak masuk akal.
 * Nomor inilah kunci anti-duplikat di database.
 */
export function normalizePhone(input: unknown): string | null {
  if (input === null || input === undefined) return null;

  let raw = String(input).trim();
  if (!raw) return null;

  // Excel kadang menyimpan nomor sebagai angka: 6.28123e+11
  if (/e\+/i.test(raw) && !Number.isNaN(Number(raw))) {
    raw = BigInt(Math.round(Number(raw))).toString();
  }

  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("620")) {
    digits = "62" + digits.slice(3);
  } else if (!digits.startsWith("62")) {
    if (digits.startsWith("0")) digits = "62" + digits.slice(1);
    else if (digits.startsWith("8")) digits = "62" + digits;
    // selain itu dianggap nomor luar negeri, dibiarkan apa adanya
  }

  if (digits.length < 9 || digits.length > 16) return null;
  return digits;
}

/** Tampilan nomor supaya enak dibaca: +62 812-3456-7890 */
export function formatPhone(phone: string): string {
  if (!phone.startsWith("62")) return "+" + phone;
  const rest = phone.slice(2);
  const parts = [rest.slice(0, 3), rest.slice(3, 7), rest.slice(7)].filter(Boolean);
  return "+62 " + parts.join("-");
}

/** Link WhatsApp langsung ke tamu. */
export function waLink(phone: string): string {
  return `https://wa.me/${phone}`;
}

/**
 * Mengambil kode undangan dari apa pun hasil scan QR.
 * Mendukung: "INV-0001", URL undangan (?to= / ?code= / /INV-0001), atau kode polos.
 */
export function extractCode(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;

  const direct = text.match(/INV-\d{3,}/i);
  if (direct) return direct[0].toUpperCase();

  if (/^https?:\/\//i.test(text)) {
    try {
      const url = new URL(text);
      for (const key of ["code", "to", "kode", "guest", "id"]) {
        const value = url.searchParams.get(key);
        if (value?.trim()) return value.trim().toUpperCase();
      }
      const last = url.pathname.split("/").filter(Boolean).pop();
      if (last) return decodeURIComponent(last).toUpperCase();
    } catch {
      // biarkan jatuh ke pemeriksaan di bawah
    }
  }

  if (/^[A-Za-z0-9_-]{3,40}$/.test(text)) return text.toUpperCase();
  return null;
}

/** Isi QR untuk satu tamu. Kalau ada base URL, kode ditempel sebagai query ?to= */
export function qrPayload(code: string, base?: string | null): string {
  const prefix = (base ?? "").trim();
  if (!prefix) return code;
  const joiner = prefix.includes("?") ? "&" : "?";
  return `${prefix.replace(/[?&]$/, "")}${joiner}to=${encodeURIComponent(code)}`;
}

export function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
