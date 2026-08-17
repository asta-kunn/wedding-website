"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CheckInSheet from "@/components/CheckInSheet";
import { formatPhone, type Guest, type Stats } from "@/lib/guest";

type Html5QrcodeInstance = {
  start: (
    camera: { facingMode: string } | { deviceId: { exact: string } },
    config: Record<string, unknown>,
    onSuccess: (text: string) => void,
    onError?: (message: string) => void
  ) => Promise<void>;
  stop: () => Promise<void>;
  clear: () => void;
  getState: () => number;
};

type Feedback = { tone: "ok" | "warn" | "error"; text: string } | null;

const READER_ID = "qr-reader";

/** Bunyi pendek sebagai konfirmasi, tanpa perlu file audio. */
function beep(ok: boolean) {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = ok ? 880 : 220;
    gain.gain.value = 0.08;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
    setTimeout(() => ctx.close(), 400);
  } catch {
    // perangkat tanpa izin audio: lewati saja
  }
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

export default function ScanClient() {
  const [officer, setOfficer] = useState("");
  const [editingOfficer, setEditingOfficer] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [candidates, setCandidates] = useState<Guest[]>([]);
  const [manual, setManual] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [looking, setLooking] = useState(false);

  const scannerRef = useRef<Html5QrcodeInstance | null>(null);
  const busyRef = useRef(false); // mencegah satu QR terbaca berulang kali

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch("/api/guests", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setStats(data.stats as Stats);
    } catch {
      // statistik bersifat tambahan; kegagalan diabaikan
    }
  }, []);

  useEffect(() => {
    setOfficer(window.localStorage.getItem("wcs_officer") ?? "");
    loadStats();
  }, [loadStats]);

  const lookup = useCallback(
    async (raw: string) => {
      if (!raw.trim()) return;
      setLooking(true);
      setCandidates([]);

      try {
        const response = await fetch(`/api/lookup?raw=${encodeURIComponent(raw)}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (response.status === 404) {
          beep(false);
          vibrate([80, 60, 80]);
          setFeedback({ tone: "error", text: `Tidak ada tamu dengan kode ${data.code}.` });
          return;
        }
        if (!response.ok) {
          setFeedback({ tone: "error", text: data.error ?? "Gagal mencari tamu." });
          return;
        }

        if (data.candidates) {
          setCandidates(data.candidates as Guest[]);
          setFeedback({ tone: "warn", text: "Beberapa nama mirip. Pilih satu." });
          return;
        }

        beep(true);
        vibrate(50);
        setFeedback(null);
        setGuest(data.guest as Guest);
      } catch {
        setFeedback({ tone: "error", text: "Koneksi terputus. Coba lagi." });
      } finally {
        setLooking(false);
      }
    },
    []
  );

  const stopCamera = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;
    try {
      await scanner.stop();
      scanner.clear();
    } catch {
      // kamera mungkin sudah berhenti
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (scannerRef.current) return;
    setCameraError(null);

    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");

      const scanner = new Html5Qrcode(READER_ID, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      }) as unknown as Html5QrcodeInstance;

      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          aspectRatio: 1,
          qrbox: (width: number, height: number) => {
            const size = Math.floor(Math.min(width, height) * 0.72);
            return { width: size, height: size };
          },
        },
        (text: string) => {
          if (busyRef.current) return;
          busyRef.current = true;
          lookup(text).finally(() => {
            // beri jeda supaya QR yang sama tidak langsung terbaca lagi
            setTimeout(() => {
              busyRef.current = false;
            }, 1800);
          });
        }
      );

      setScanning(true);
    } catch (error) {
      scannerRef.current = null;
      setScanning(false);
      const message = error instanceof Error ? error.message : String(error);
      setCameraError(
        /permission|denied|notallowed/i.test(message)
          ? "Izin kamera ditolak. Aktifkan izin kamera untuk situs ini, lalu coba lagi."
          : "Kamera tidak bisa dibuka. Pastikan situs diakses lewat HTTPS, atau masukkan kode manual."
      );
    }
  }, [lookup]);

  useEffect(() => {
    return () => {
      void stopCamera();
    };
  }, [stopCamera]);

  function handleSaved(updated: Guest) {
    setGuest(null);
    setFeedback({ tone: "ok", text: `${updated.name} tercatat hadir.` });
    loadStats();
  }

  return (
    <div>
      {/* ---------- Kepala halaman ---------- */}
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Meja Penerima Tamu</p>
          <h1 className="mt-1 font-display text-2xl text-paper">Pindai undangan</h1>
        </div>

        <div className="text-right">
          {editingOfficer ? (
            <input
              autoFocus
              value={officer}
              onChange={(event) => setOfficer(event.target.value)}
              onBlur={() => {
                window.localStorage.setItem("wcs_officer", officer.trim());
                setEditingOfficer(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
              placeholder="Nama petugas"
              className="w-36 rounded-lg border border-night-line bg-night-deep px-2 py-1 text-right text-xs text-paper focus:border-brass-dim focus:outline-none"
            />
          ) : (
            <button
              onClick={() => setEditingOfficer(true)}
              className="font-mono text-[10px] uppercase tracking-eyebrow text-brass-dim hover:text-brass-light"
            >
              Petugas: {officer.trim() || "atur nama"}
            </button>
          )}
        </div>
      </header>

      {/* ---------- Statistik ringkas ---------- */}
      {stats ? (
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { label: "Hadir", value: stats.hadir },
            { label: "Orang", value: stats.pax },
            { label: "Belum", value: stats.belum },
          ].map((item) => (
            <div key={item.label} className="card-night px-3 py-2 text-center">
              <p className="font-display text-xl text-brass-light">{item.value}</p>
              <p className="font-mono text-[9px] uppercase tracking-eyebrow text-paper-mute">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {/* ---------- Kotak kamera ---------- */}
      <div className="relative mt-5 overflow-hidden rounded-2xl border border-night-line bg-night-deep">
        <div className="relative aspect-square w-full">
          <div id={READER_ID} className="h-full w-full" />

          {!scanning ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8 text-center">
              <span aria-hidden className="text-3xl text-brass">
                ◎
              </span>
              <p className="text-sm text-paper-mute">
                {cameraError ?? "Kamera belum aktif. Nyalakan untuk mulai memindai."}
              </p>
              <button onClick={startCamera} className="btn-brass">
                Nyalakan kamera
              </button>
            </div>
          ) : (
            <>
              {/* Empat sudut kuningan sebagai bingkai bidik */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-[14%]">
                  {[
                    "left-0 top-0 border-l-2 border-t-2 rounded-tl-lg",
                    "right-0 top-0 border-r-2 border-t-2 rounded-tr-lg",
                    "left-0 bottom-0 border-l-2 border-b-2 rounded-bl-lg",
                    "right-0 bottom-0 border-r-2 border-b-2 rounded-br-lg",
                  ].map((position) => (
                    <span
                      key={position}
                      className={`absolute h-9 w-9 border-brass-light/90 ${position}`}
                    />
                  ))}
                  <span className="scan-line animate-sweep absolute inset-x-2 h-[2px]" />
                </div>
              </div>

              <button
                onClick={() => {
                  void stopCamera();
                  setScanning(false);
                }}
                className="absolute bottom-3 right-3 rounded-lg border border-brass-dim/60 bg-night-deep/80 px-3 py-1.5 text-xs text-brass-light"
              >
                Matikan
              </button>
            </>
          )}
        </div>
      </div>

      {looking ? (
        <p className="mt-3 text-center text-xs text-brass-light">Mencari tamu…</p>
      ) : null}

      {feedback ? (
        <p
          role="status"
          className={`mt-3 rounded-xl border px-4 py-3 text-sm ${
            feedback.tone === "ok"
              ? "border-leaf/50 bg-leaf/10 text-paper"
              : feedback.tone === "warn"
                ? "border-brass-dim/60 bg-brass/10 text-paper"
                : "border-rose/60 bg-rose/10 text-paper"
          }`}
        >
          {feedback.text}
        </p>
      ) : null}

      {/* ---------- Pilihan kalau nama mirip ---------- */}
      {candidates.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {candidates.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  setCandidates([]);
                  setGuest(item);
                }}
                className="card-night flex w-full items-center justify-between px-4 py-3 text-left hover:border-brass-dim"
              >
                <span>
                  <span className="block text-sm text-paper">{item.name}</span>
                  <span className="font-mono text-[11px] text-paper-mute">
                    {item.code} · {formatPhone(item.phone)}
                  </span>
                </span>
                <span className="text-xs text-brass-light">
                  {item.attended ? "sudah hadir" : "pilih"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {/* ---------- Jalur manual kalau QR rusak ---------- */}
      <div className="mt-6">
        <p className="eyebrow">QR rusak atau tamu lupa undangan</p>
        <div className="mt-2 flex gap-2">
          <input
            value={manual}
            onChange={(event) => setManual(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                lookup(manual);
                setManual("");
              }
            }}
            placeholder="Kode INV-0001, nomor HP, atau nama"
            className="field flex-1"
          />
          <button
            onClick={() => {
              lookup(manual);
              setManual("");
            }}
            disabled={!manual.trim()}
            className="btn-ghost"
          >
            Cari
          </button>
        </div>
      </div>

      {guest ? (
        <CheckInSheet
          guest={guest}
          officer={officer}
          onSaved={handleSaved}
          onClose={() => setGuest(null)}
        />
      ) : null}
    </div>
  );
}
