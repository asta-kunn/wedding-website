"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GIFT_LABEL,
  formatPhone,
  formatTime,
  waLink,
  type Guest,
  type Stats,
} from "@/lib/guest";

type Filter = "semua" | "hadir" | "belum";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "hadir", label: "Hadir" },
  { key: "belum", label: "Belum" },
];

export default function GuestsClient() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState<Filter>("semua");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch("/api/guests", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal memuat daftar tamu.");
        return;
      }
      setGuests(data.guests as Guest[]);
      setStats(data.stats as Stats);
    } catch {
      setError("Koneksi terputus.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const digits = query.replace(/\D/g, "");

    return guests.filter((guest) => {
      if (filter === "hadir" && !guest.attended) return false;
      if (filter === "belum" && guest.attended) return false;
      if (!needle) return true;
      return (
        guest.name.toLowerCase().includes(needle) ||
        guest.code.toLowerCase().includes(needle) ||
        (digits.length >= 3 && guest.phone.includes(digits))
      );
    });
  }, [guests, filter, query]);

  async function addGuest() {
    if (!newName.trim() || !newPhone.trim()) return;
    setPending("add");
    try {
      const response = await fetch("/api/guests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: newName, phone: newPhone }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal menambah tamu.");
        return;
      }
      setNewName("");
      setNewPhone("");
      setAdding(false);
      await load();
    } finally {
      setPending(null);
    }
  }

  async function resetAttendance(guest: Guest) {
    const yes = window.confirm(
      `Batalkan kehadiran ${guest.name}? Jumlah orang, jenis hadiah, dan catatan akan dihapus.`
    );
    if (!yes) return;

    setPending(guest.id);
    try {
      await fetch(`/api/guests/${guest.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      await load();
    } finally {
      setPending(null);
    }
  }

  async function removeGuest(guest: Guest) {
    const yes = window.confirm(
      `Hapus ${guest.name} (${guest.code}) dari daftar? Tindakan ini tidak bisa dibatalkan, dan kartu QR yang sudah dicetak jadi tidak berlaku.`
    );
    if (!yes) return;

    setPending(guest.id);
    try {
      await fetch(`/api/guests/${guest.id}`, { method: "DELETE" });
      await load();
    } finally {
      setPending(null);
    }
  }

  return (
    <div>
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Buku Tamu</p>
          <h1 className="mt-1 font-display text-2xl text-paper">Daftar kehadiran</h1>
        </div>
        <a href="/api/export" className="btn-ghost px-3 py-2 text-xs">
          Unduh CSV
        </a>
      </header>

      {stats ? (
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Total tamu", value: stats.total },
            { label: "Hadir", value: stats.hadir },
            { label: "Total orang", value: stats.pax },
            { label: "Amplop / Transfer", value: `${stats.amplop} / ${stats.transfer}` },
          ].map((item) => (
            <div key={item.label} className="card-night px-3 py-3">
              <p className="font-display text-xl text-brass-light">{item.value}</p>
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-eyebrow text-paper-mute">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari nama, kode, atau nomor"
          className="field flex-1 min-w-[200px]"
        />
        <div className="flex gap-1">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`chip ${
                filter === item.key
                  ? "border-brass bg-brass/20 text-brass-light"
                  : "border-night-line text-paper-mute hover:border-brass-dim"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tambah satu tamu tanpa lewat Excel */}
      <div className="mt-3">
        {adding ? (
          <div className="card-night flex flex-wrap items-center gap-2 p-3">
            <input
              autoFocus
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Nama tamu"
              className="field flex-1 min-w-[160px] py-2"
            />
            <input
              value={newPhone}
              onChange={(event) => setNewPhone(event.target.value)}
              placeholder="08xxxxxxxxxx"
              inputMode="tel"
              className="field w-44 py-2"
            />
            <button
              onClick={addGuest}
              disabled={pending === "add" || !newName.trim() || !newPhone.trim()}
              className="btn-brass px-3 py-2 text-xs"
            >
              Simpan
            </button>
            <button onClick={() => setAdding(false)} className="btn-ghost px-3 py-2 text-xs">
              Batal
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="font-mono text-[11px] uppercase tracking-eyebrow text-brass-dim hover:text-brass-light"
          >
            + Tambah tamu satu per satu
          </button>
        )}
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-xl border border-rose/60 bg-rose/10 px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      {/* Daftar tamu */}
      <div className="mt-4">
        {loading ? (
          <p className="py-10 text-center text-sm text-paper-mute">Memuat…</p>
        ) : visible.length === 0 ? (
          <div className="card-night px-6 py-12 text-center">
            <p className="font-display text-lg text-paper">Belum ada tamu di daftar ini</p>
            <p className="mt-2 text-sm text-paper-mute">
              Unggah file Excel di menu Impor, atau tambahkan satu per satu di atas.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {visible.map((guest) => (
              <li
                key={guest.id}
                className={`card-night px-4 py-3 ${pending === guest.id ? "opacity-50" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          guest.attended ? "bg-leaf" : "bg-night-line"
                        }`}
                      />
                      <p className="truncate font-display text-base text-paper">{guest.name}</p>
                    </div>

                    <p className="mt-1 font-mono text-[11px] text-paper-mute">
                      {guest.code} ·{" "}
                      <a
                        href={waLink(guest.phone)}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-night-line"
                      >
                        {formatPhone(guest.phone)}
                      </a>
                    </p>

                    {guest.attended ? (
                      <p className="mt-1 text-xs text-paper-dim">
                        {guest.pax ?? "?"} orang ·{" "}
                        {guest.gift_type ? GIFT_LABEL[guest.gift_type] : "—"} ·{" "}
                        {formatTime(guest.checked_in_at)}
                        {guest.checked_in_by ? ` · ${guest.checked_in_by}` : ""}
                      </p>
                    ) : null}

                    {guest.note ? (
                      <p className="mt-1 text-xs italic text-paper-mute">{guest.note}</p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`chip ${
                        guest.attended
                          ? "border-leaf/50 bg-leaf/15 text-paper"
                          : "border-night-line text-paper-mute"
                      }`}
                    >
                      {guest.attended ? "Hadir" : "Belum"}
                    </span>

                    <div className="flex gap-2">
                      {guest.attended ? (
                        <button
                          onClick={() => resetAttendance(guest)}
                          className="text-[11px] text-paper-mute underline hover:text-brass-light"
                        >
                          batalkan
                        </button>
                      ) : null}
                      <button
                        onClick={() => removeGuest(guest)}
                        className="text-[11px] text-paper-mute underline hover:text-rose"
                      >
                        hapus
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-eyebrow text-paper-mute">
        {visible.length} dari {guests.length} tamu
      </p>
    </div>
  );
}
