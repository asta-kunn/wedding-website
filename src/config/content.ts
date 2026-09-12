/**
 * Semua teks konten undangan (bukan UI chrome — itu ada di config/i18n.ts).
 * Semua nilai di sini masih PLACEHOLDER, ganti sebelum dikirim ke tamu.
 */
export const CONTENT = {
  groom: {
    fullName: "[Nama Lengkap Mempelai Pria] — placeholder",
    shortName: "[Pria]",
    parents: "Putra dari Bapak [...] & Ibu [...] — placeholder",
  },
  bride: {
    fullName: "[Nama Lengkap Mempelai Wanita] — placeholder",
    shortName: "[Wanita]",
    parents: "Putri dari Bapak [...] & Ibu [...] — placeholder",
  },
  quote: {
    id: "“[Kutipan pembuka — placeholder]”",
    en: "“[Opening quote — placeholder”",
  },
  story: [
    {
      year: "20XX",
      title: { id: "Pertama Bertemu", en: "First Met" },
      text: { id: "[Cerita placeholder — ganti nanti]", en: "[Placeholder story — replace later]" },
    },
    {
      year: "20XX",
      title: { id: "Menjalin Hubungan", en: "Started Dating" },
      text: { id: "[Cerita placeholder — ganti nanti]", en: "[Placeholder story — replace later]" },
    },
    {
      year: "20XX",
      title: { id: "Lamaran", en: "The Proposal" },
      text: { id: "[Cerita placeholder — ganti nanti]", en: "[Placeholder story — replace later]" },
    },
    {
      year: "2026",
      title: { id: "Menikah", en: "Getting Married" },
      text: { id: "[Cerita placeholder — ganti nanti]", en: "[Placeholder story — replace later]" },
    },
  ],
  closing: {
    id: "Terima kasih atas doa dan restu yang diberikan. Kehadiran serta dukungan Anda adalah kebahagiaan bagi kami. — placeholder",
    en: "Thank you for your prayers and blessings. Your presence and support mean the world to us. — placeholder",
  },
  galleryCount: 6,
} as const;
