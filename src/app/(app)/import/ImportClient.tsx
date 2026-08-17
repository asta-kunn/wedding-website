"use client";

import { useRef, useState } from "react";
import { formatPhone, normalizePhone } from "@/lib/guest";

type ParsedRow = {
  row: number;
  name: string;
  phone: string | null;
  problem: string | null;
  duplicateOf: number | null;
};

type ImportResult = {
  inserted: number;
  replaced: number;
  duplicateInFile: number;
  rejected: { row: number; name: string; reason: string }[];
};

const HEADER_ALIASES: Record<string, "name" | "phone"> = {
  nama: "name",
  name: "name",
  "nama tamu": "name",
  nama_tamu: "name",
  "no hp": "phone",
  no_hp: "phone",
  nohp: "phone",
  hp: "phone",
  phone: "phone",
  telepon: "phone",
  telp: "phone",
  wa: "phone",
  whatsapp: "phone",
  "nomor hp": "phone",
};

function pickColumns(raw: Record<string, unknown>): { name: unknown; phone: unknown } {
  let name: unknown = "";
  let phone: unknown = "";

  for (const [key, value] of Object.entries(raw)) {
    const target = HEADER_ALIASES[key.trim().toLowerCase()];
    if (target === "name" && !name) name = value;
    if (target === "phone" && !phone) phone = value;
  }

  // Kalau judul kolom tidak dikenali, ambil dua kolom pertama sesuai urutan.
  if (!name && !phone) {
    const values = Object.values(raw);
    name = values[0];
    phone = values[1];
  }

  return { name, phone };
}

export default function ImportClient() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validRows = rows.filter((row) => !row.problem && row.duplicateOf === null);
  const problemRows = rows.filter((row) => row.problem);
  const duplicateRows = rows.filter((row) => !row.problem && row.duplicateOf !== null);

  async function downloadTemplate() {
    const XLSX = await import("xlsx");
    const sheet = XLSX.utils.aoa_to_sheet([
      ["nama", "no_hp"],
      ["Budi Santoso", "081234567890"],
      ["Siti Aminah", "085611122233"],
    ]);
    sheet["!cols"] = [{ wch: 32 }, { wch: 18 }];

    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Tamu");
    XLSX.writeFile(book, "template-daftar-tamu.xlsx");
  }

  async function handleFile(file: File) {
    setParsing(true);
    setError(null);
    setResult(null);
    setFileName(file.name);

    try {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const book = XLSX.read(buffer, { type: "array" });
      const sheet = book.Sheets[book.SheetNames[0]];

      if (!sheet) {
        setError("File tidak punya lembar kerja yang bisa dibaca.");
        setRows([]);
        return;
      }

      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
        raw: false,
      });

      const seen = new Map<string, number>();
      const parsed: ParsedRow[] = raw.map((entry, index) => {
        const rowNumber = index + 2; // baris 1 adalah judul kolom
        const { name: rawName, phone: rawPhone } = pickColumns(entry);
        const name = String(rawName ?? "").trim().replace(/\s+/g, " ");
        const phone = normalizePhone(rawPhone);

        let problem: string | null = null;
        if (!name) problem = "Nama kosong";
        else if (!phone) problem = "Nomor HP kosong atau tidak valid";

        let duplicateOf: number | null = null;
        if (!problem && phone) {
          const previous = seen.get(phone);
          if (previous !== undefined) duplicateOf = previous;
          seen.set(phone, rowNumber);
        }

        return { row: rowNumber, name, phone, problem, duplicateOf };
      });

      // Nomor yang muncul dua kali: yang dipakai adalah baris terakhir.
      const lastRowByPhone = new Map<string, number>();
      for (const row of parsed) {
        if (!row.problem && row.phone) lastRowByPhone.set(row.phone, row.row);
      }
      for (const row of parsed) {
        if (!row.problem && row.phone) {
          const winner = lastRowByPhone.get(row.phone);
          row.duplicateOf = winner === row.row ? null : (winner ?? null);
        }
      }

      setRows(parsed);

      if (parsed.length === 0) {
        setError("Tidak ada baris data di file ini.");
      }
    } catch {
      setError("File gagal dibaca. Pastikan formatnya .xlsx, .xls, atau .csv.");
      setRows([]);
    } finally {
      setParsing(false);
    }
  }

  async function save() {
    if (validRows.length === 0) return;
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          rows: validRows.map((row) => ({ name: row.name, phone: row.phone })),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Impor gagal.");
        return;
      }

      setResult(data as ImportResult);
      setRows([]);
      setFileName(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      setError("Koneksi terputus saat menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <header>
        <p className="eyebrow">Buku Tamu</p>
        <h1 className="mt-1 font-display text-2xl text-paper">Impor daftar tamu</h1>
        <p className="mt-2 text-sm text-paper-mute">
          Dua kolom saja: <span className="font-mono text-brass-light">nama</span> dan{" "}
          <span className="font-mono text-brass-light">no_hp</span>. Nomor HP adalah penanda unik —
          nomor yang sudah ada di database akan ditimpa dengan nama terbaru, dan kode undangan serta
          catatan kehadirannya tetap utuh.
        </p>
      </header>

      <div className="mt-5 flex flex-wrap gap-2">
        <button onClick={downloadTemplate} className="btn-ghost">
          Unduh template Excel
        </button>
        <button onClick={() => inputRef.current?.click()} className="btn-brass">
          Pilih file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {fileName ? (
        <p className="mt-3 font-mono text-[11px] text-paper-mute">Berkas: {fileName}</p>
      ) : null}

      {parsing ? <p className="mt-4 text-sm text-brass-light">Membaca file…</p> : null}

      {error ? (
        <p role="alert" className="mt-4 rounded-xl border border-rose/60 bg-rose/10 px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      {/* Hasil impor */}
      {result ? (
        <div className="mt-5 rounded-2xl border border-leaf/50 bg-leaf/10 px-5 py-4">
          <p className="font-display text-lg text-paper">Impor selesai</p>
          <ul className="mt-2 space-y-1 text-sm text-paper-dim">
            <li>{result.inserted} tamu baru ditambahkan.</li>
            <li>{result.replaced} tamu diperbarui karena nomornya sudah ada.</li>
            {result.duplicateInFile > 0 ? (
              <li>{result.duplicateInFile} nomor ganda di dalam file, dipakai baris terakhir.</li>
            ) : null}
            {result.rejected.length > 0 ? (
              <li>{result.rejected.length} baris dilewati karena datanya tidak lengkap.</li>
            ) : null}
          </ul>
          <a href="/qr" className="btn-paper mt-4 bg-paper/90">
            Cetak kartu QR
          </a>
        </div>
      ) : null}

      {/* Pratinjau sebelum menyimpan */}
      {rows.length > 0 ? (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="chip border-leaf/50 bg-leaf/15 text-paper">
              {validRows.length} siap disimpan
            </span>
            {duplicateRows.length > 0 ? (
              <span className="chip border-brass-dim/60 bg-brass/10 text-paper">
                {duplicateRows.length} nomor ganda di file
              </span>
            ) : null}
            {problemRows.length > 0 ? (
              <span className="chip border-rose/60 bg-rose/10 text-paper">
                {problemRows.length} ditolak
              </span>
            ) : null}
          </div>

          <div className="mt-3 max-h-[420px] overflow-auto rounded-2xl border border-night-line">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-night-soft/95 backdrop-blur">
                <tr className="font-mono text-[10px] uppercase tracking-eyebrow text-paper-mute">
                  <th className="px-3 py-2">Baris</th>
                  <th className="px-3 py-2">Nama</th>
                  <th className="px-3 py-2">Nomor</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.row} className="border-t border-night-line/60">
                    <td className="px-3 py-2 font-mono text-[11px] text-paper-mute">{row.row}</td>
                    <td className="px-3 py-2 text-paper">{row.name || "—"}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-paper-dim">
                      {row.phone ? formatPhone(row.phone) : "—"}
                    </td>
                    <td className="px-3 py-2 text-[11px]">
                      {row.problem ? (
                        <span className="text-rose">{row.problem}</span>
                      ) : row.duplicateOf !== null ? (
                        <span className="text-brass-light">
                          ganda, dipakai baris {row.duplicateOf}
                        </span>
                      ) : (
                        <span className="text-leaf">siap</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={save}
            disabled={saving || validRows.length === 0}
            className="btn-brass mt-4 w-full"
          >
            {saving ? "Menyimpan…" : `Simpan ${validRows.length} tamu ke database`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
