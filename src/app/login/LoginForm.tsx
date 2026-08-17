"use client";

import { useState } from "react";

export default function LoginForm() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!pin.trim() || busy) return;
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "PIN salah.");
        setPin("");
        setBusy(false);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");
      window.location.replace(next && next.startsWith("/") ? next : "/scan");
    } catch {
      setError("Tidak bisa menghubungi server. Periksa koneksi.");
      setBusy(false);
    }
  }

  return (
    <div className="paper paper-frame rounded-2xl px-6 py-7 shadow-card">
      <div className="relative">
        <label htmlFor="pin" className="font-mono text-[10px] uppercase tracking-eyebrow text-paper-mute">
          PIN Petugas
        </label>

        <input
          id="pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          value={pin}
          onChange={(event) => setPin(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
          placeholder="••••••"
          className="mt-2 w-full rounded-xl border border-paper-line bg-white/70 px-4 py-3
                     text-center font-mono text-2xl tracking-[0.4em] text-paper-ink
                     placeholder:text-paper-line focus:border-brass focus:outline-none"
        />

        {error ? (
          <p role="alert" className="mt-3 text-center text-sm text-rose">
            {error}
          </p>
        ) : null}

        <button
          onClick={submit}
          disabled={busy || !pin.trim()}
          className="btn mt-5 w-full bg-night text-paper hover:bg-night-soft disabled:opacity-40"
        >
          {busy ? "Memeriksa…" : "Buka pemindai"}
        </button>
      </div>
    </div>
  );
}
