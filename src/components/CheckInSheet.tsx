"use client";

import { useEffect, useState } from "react";
import { GIFT_LABEL, formatPhone, formatTime, waLink, type GiftType, type Guest } from "@/lib/guest";

const GIFTS: GiftType[] = ["amplop", "transfer", "tidak_ada"];
const QUICK_PAX = [1, 2, 3, 4];

type Props = {
  guest: Guest;
  officer: string;
  onSaved: (guest: Guest) => void;
  onClose: () => void;
};

export default function CheckInSheet({ guest, officer, onSaved, onClose }: Props) {
  const [pax, setPax] = useState<number>(guest.pax ?? 1);
  const [gift, setGift] = useState<GiftType | null>(guest.gift_type ?? null);
  const [note, setNote] = useState(guest.note ?? "");
  const [showNote, setShowNote] = useState(Boolean(guest.note));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<Guest | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Esc menutup panel selama belum tersimpan.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving && !saved) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving, saved]);

  // Setelah tercatat, panel menutup sendiri supaya petugas langsung pindai berikutnya.
  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => onSaved(saved), 1500);
    return () => clearTimeout(timer);
  }, [saved, onSaved]);

  async function submit() {
    if (!gift) {
      setError("Pilih dulu: amplop, transfer, atau tidak ada.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: guest.id, pax, gift_type: gift, note, by: officer }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Gagal menyimpan.");
        setSaving(false);
        return;
      }
      setSaved(data.guest as Guest);
    } catch {
      setError("Koneksi terputus. Coba lagi.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        aria-label="Tutup"
        onClick={() => (!saving && !saved ? onClose() : undefined)}
        className="absolute inset-0 animate-fadeIn bg-night-deep/80 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Catat kehadiran ${guest.name}`}
        className="paper relative z-10 max-h-[92vh] w-full max-w-md animate-riseUp overflow-y-auto
                   rounded-t-3xl px-6 pb-8 pt-6 shadow-sheet sm:rounded-3xl"
      >
        {/* Kepala kartu: nomor undangan sebagai nomor seri */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-eyebrow text-brass-dim">
              {guest.code}
            </p>
            <h2 className="mt-1 font-display text-[26px] leading-tight text-paper-ink">
              {guest.name}
            </h2>
            <a
              href={waLink(guest.phone)}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block font-mono text-xs text-paper-mute underline decoration-paper-line"
            >
              {formatPhone(guest.phone)}
            </a>
          </div>

          {!saved && !saving ? (
            <button
              onClick={onClose}
              aria-label="Tutup tanpa mencatat"
              className="-mr-1 -mt-1 rounded-full px-3 py-1 text-lg text-paper-mute hover:bg-paper-dim"
            >
              ×
            </button>
          ) : null}
        </div>

        {guest.attended && !saved ? (
          <p className="mt-4 rounded-xl border border-brass-dim/50 bg-brass/10 px-3 py-2 text-xs text-paper-ink">
            Tamu ini sudah tercatat {formatTime(guest.checked_in_at)}
            {guest.pax ? ` · ${guest.pax} orang` : ""}
            {guest.gift_type ? ` · ${GIFT_LABEL[guest.gift_type]}` : ""}. Menyimpan lagi akan
            menimpa catatan tersebut.
          </p>
        ) : null}

        <div className="my-5 h-px bg-paper-line" />

        {saved ? (
          /* ---------- Cap kehadiran ---------- */
          <div className="py-6 text-center">
            <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
              <div className="animate-stamp flex h-32 w-32 flex-col items-center justify-center rounded-full border-[3px] border-leaf/80 text-leaf">
                <span className="font-display text-2xl tracking-wide">HADIR</span>
                <span className="mt-1 font-mono text-[10px] tracking-eyebrow">
                  {saved.pax} ORANG
                </span>
              </div>
            </div>
            <p className="mt-5 font-display text-lg text-paper-ink">
              {saved.gift_type ? GIFT_LABEL[saved.gift_type] : "—"} tercatat
            </p>
            <p className="mt-1 text-xs text-paper-mute">
              {formatTime(saved.checked_in_at)}
              {saved.checked_in_by ? ` · ${saved.checked_in_by}` : ""}
            </p>
            <button onClick={() => onSaved(saved)} className="btn-paper mt-6 w-full">
              Pindai tamu berikutnya
            </button>
          </div>
        ) : (
          /* ---------- Formulir ---------- */
          <>
            <fieldset>
              <legend className="font-mono text-[10px] uppercase tracking-eyebrow text-paper-mute">
                Datang berapa orang
              </legend>

              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => setPax((value) => Math.max(1, value - 1))}
                  aria-label="Kurangi jumlah orang"
                  className="h-12 w-12 rounded-xl border border-paper-line text-xl text-paper-ink hover:bg-paper-dim"
                >
                  −
                </button>

                <div className="flex h-12 flex-1 items-center justify-center rounded-xl border border-paper-line bg-white/60">
                  <span className="font-display text-2xl text-paper-ink">{pax}</span>
                  <span className="ml-2 text-xs text-paper-mute">orang</span>
                </div>

                <button
                  onClick={() => setPax((value) => Math.min(99, value + 1))}
                  aria-label="Tambah jumlah orang"
                  className="h-12 w-12 rounded-xl border border-paper-line text-xl text-paper-ink hover:bg-paper-dim"
                >
                  +
                </button>
              </div>

              <div className="mt-2 flex gap-2">
                {QUICK_PAX.map((value) => (
                  <button
                    key={value}
                    onClick={() => setPax(value)}
                    className={`chip flex-1 ${
                      pax === value
                        ? "border-brass bg-brass/20 text-paper-ink"
                        : "border-paper-line text-paper-mute hover:border-brass-dim"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="font-mono text-[10px] uppercase tracking-eyebrow text-paper-mute">
                Hadiah
              </legend>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {GIFTS.map((value) => (
                  <button
                    key={value}
                    onClick={() => {
                      setGift(value);
                      setError(null);
                    }}
                    className={`rounded-xl border px-2 py-3 text-sm transition ${
                      gift === value
                        ? "border-brass bg-brass/20 font-medium text-paper-ink"
                        : "border-paper-line text-paper-mute hover:border-brass-dim"
                    }`}
                  >
                    {GIFT_LABEL[value]}
                  </button>
                ))}
              </div>
            </fieldset>

            {showNote ? (
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={2}
                placeholder="Catatan, misal: keluarga mempelai wanita"
                className="mt-4 w-full rounded-xl border border-paper-line bg-white/60 px-3 py-2
                           text-sm text-paper-ink placeholder:text-paper-line focus:border-brass focus:outline-none"
              />
            ) : (
              <button
                onClick={() => setShowNote(true)}
                className="mt-4 font-mono text-[11px] uppercase tracking-eyebrow text-paper-mute underline"
              >
                + Tambah catatan
              </button>
            )}

            {error ? (
              <p role="alert" className="mt-4 text-sm text-rose">
                {error}
              </p>
            ) : null}

            <button
              onClick={submit}
              disabled={saving}
              className="btn mt-6 w-full bg-night text-paper hover:bg-night-soft"
            >
              {saving ? "Menyimpan…" : guest.attended ? "Perbarui catatan" : "Catat kehadiran"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
