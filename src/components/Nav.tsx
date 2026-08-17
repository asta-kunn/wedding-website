"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/scan", label: "Pindai", glyph: "◎" },
  { href: "/guests", label: "Tamu", glyph: "☰" },
  { href: "/import", label: "Impor", glyph: "↑" },
  { href: "/qr", label: "Kartu QR", glyph: "▣" },
];

async function signOut() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.replace("/login");
}

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-night-line/80
                 bg-night-deep/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-3xl items-stretch">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href} className="flex-1">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-3 text-[11px] transition ${
                  active ? "text-brass-light" : "text-paper-mute hover:text-paper-dim"
                }`}
              >
                <span aria-hidden className="text-base leading-none">
                  {link.glyph}
                </span>
                {link.label}
                <span
                  className={`h-px w-6 transition ${active ? "bg-brass" : "bg-transparent"}`}
                />
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          <button
            onClick={signOut}
            className="flex h-full w-full flex-col items-center gap-1 py-3 text-[11px]
                       text-paper-mute transition hover:text-rose"
          >
            <span aria-hidden className="text-base leading-none">
              ⎋
            </span>
            Keluar
            <span className="h-px w-6" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
