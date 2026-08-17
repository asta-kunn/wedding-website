"use client";

import { useCallback, useEffect, useState } from "react";
import { qrPayload, type Guest } from "@/lib/guest";

type Card = { guest: Guest; dataUrl: string };

const DEFAULT_BASE = process.env.NEXT_PUBLIC_INVITE_BASE ?? "";

export default function QrClient() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [base, setBase] = useState(DEFAULT_BASE);
  const [cards, setCards] = useState<Card[]>([]);
  const [progress, setProgress] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/guests", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error ?? "Gagal memuat daftar tamu.");
          return;
        }
        setGuests(data.guests as Guest[]);
      } catch {
        setError("Koneksi terputus.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const build = useCallback(async () => {
    if (guests.length === 0) return;
    setProgress(0);
    setCards([]);

    const QRCode = (await import("qrcode")).default;
    const built: Card[] = [];

    for (let index = 0; index < guests.length; index++) {
      const guest = guests[index];
      const dataUrl = await QRCode.toDataURL(qrPayload(guest.code, base), {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 320,
        color: { dark: "#2A2418FF", light: "#FFFFFFFF" },
      });
      built.push({ guest, dataUrl });

      if (index % 10 === 0) {
        setProgress(Math.round(((index + 1) / guests.length) * 100));
        // beri ruang agar antarmuka tidak membeku saat data banyak
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    setCards(built);
    setProgress(null);
  }, [guests, base]);

  return (
    <div>
      <header className="no-print">
        <p className="eyebrow">Buku Tamu</p>
        <h1 className="mt-1 font-display text-2xl text-paper">Kartu QR tamu</h1>
        <p className="mt-2 text-sm text-paper-mute">
          Setiap tamu punya satu kode. Tempelkan gambar QR ini di undangan digital atau cetak sebagai
          kartu. Petugas memindainya di pintu masuk.
        </p>
      </header>

      <div className="no-print mt-5 space-y-3">
        <div>
          <label
            htmlFor="base"
            className="font-mono text-[10px] uppercase tracking-eyebrow text-paper-mute"
          >
            Isi QR
          </label>
          <input
            id="base"
            value={base}
            onChange={(event) => setBase(event.target.value)}
            placeholder="Kosongkan untuk isi kode saja, misal INV-0001"
            className="field mt-2"
          />
          <p className="mt-2 text-xs text-paper-mute">
            Kalau diisi alamat undangan, contohnya{" "}
            <span className="font-mono">https://undangan-kami.com</span>, QR akan berisi{" "}
            <span className="font-mono text-brass-light">
              {base.trim() ? qrPayload("INV-0001", base) : "INV-0001"}
            </span>
            . Pemindai tetap mengenali keduanya.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={build} disabled={progress !== null || guests.length === 0} className="btn-brass">
            {progress !== null ? `Membuat… ${progress}%` : `Buat ${guests.length} kartu QR`}
          </button>
          {cards.length > 0 ? (
            <button onClick={() => window.print()} className="btn-ghost">
              Cetak lembar kartu
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p role="alert" className="no-print mt-4 rounded-xl border border-rose/60 bg-rose/10 px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      {loading ? <p className="no-print mt-6 text-sm text-paper-mute">Memuat daftar tamu…</p> : null}

      {!loading && guests.length === 0 ? (
        <div className="no-print card-night mt-6 px-6 py-12 text-center">
          <p className="font-display text-lg text-paper">Daftar tamu masih kosong</p>
          <p className="mt-2 text-sm text-paper-mute">Impor file Excel dulu di menu Impor.</p>
        </div>
      ) : null}

      {/* Lembar kartu, tampil 2 kolom di layar dan 3 kolom saat dicetak */}
      {cards.length > 0 ? (
        <div className="print-sheet mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {cards.map(({ guest, dataUrl }) => (
            <figure
              key={guest.id}
              className="print-card paper paper-frame flex flex-col items-center rounded-xl px-3 pb-4 pt-5 text-center"
            >
              <figcaption className="order-2 mt-3 w-full">
                <p className="truncate font-display text-[15px] leading-tight text-paper-ink">
                  {guest.name}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-eyebrow text-paper-mute">
                  {guest.code}
                </p>
              </figcaption>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dataUrl}
                alt={`Kode QR untuk ${guest.name}`}
                className="order-1 h-auto w-full max-w-[150px]"
              />

              <a
                href={dataUrl}
                download={`${guest.code}-${guest.name.replace(/[^a-zA-Z0-9]+/g, "-")}.png`}
                className="no-print order-3 mt-2 font-mono text-[10px] uppercase tracking-eyebrow text-brass-dim underline"
              >
                Unduh PNG
              </a>
            </figure>
          ))}
        </div>
      ) : null}
    </div>
  );
}
