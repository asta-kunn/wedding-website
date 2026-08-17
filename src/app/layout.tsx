import type { Metadata, Viewport } from "next";
import { Marcellus, Karla, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Marcellus({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Karla({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Buku Tamu — Penerima Tamu",
  description: "Pencatat kehadiran tamu undangan lewat pemindaian QR.",
};

export const viewport: Viewport = {
  themeColor: "#0E0B18",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
