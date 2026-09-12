/**
 * Detail acara. Satu-satunya tempat tanggal/jam/lokasi didefinisikan —
 * dipakai oleh kartu detail acara, countdown, dan file .ics.
 * Jam masih placeholder, gampang diganti di sini.
 */
export type EventDetail = {
  key: "akad" | "resepsi";
  name: string;
  /** ISO lokal WIB, tanpa 'Z' — lihat lib/ics.ts */
  start: string;
  end: string;
  venue: string;
  address: string;
  mapsUrl: string;
};

export const EVENTS: EventDetail[] = [
  {
    key: "akad",
    name: "Akad Nikah",
    start: "2026-10-31T08:00:00",
    end: "2026-10-31T10:00:00",
    venue: "Nama Tempat (placeholder)",
    address: "Alamat lengkap menyusul — placeholder",
    mapsUrl: "https://maps.google.com/?q=Nama+Tempat+Placeholder",
  },
  {
    key: "resepsi",
    name: "Resepsi",
    start: "2026-11-01T11:00:00",
    end: "2026-11-01T14:00:00",
    venue: "Nama Tempat (placeholder)",
    address: "Alamat lengkap menyusul — placeholder",
    mapsUrl: "https://maps.google.com/?q=Nama+Tempat+Placeholder",
  },
];

/** Target hitung mundur: hari akad. */
export const COUNTDOWN_TARGET = EVENTS[0].start;
