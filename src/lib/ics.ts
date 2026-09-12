/** Generate file .ics minimal untuk "Simpan ke Kalender". Tanpa dependency. */
export type IcsEvent = {
  title: string;
  description?: string;
  location?: string;
  /** ISO string, waktu lokal acara (bukan UTC) */
  start: string;
  end: string;
  uid: string;
};

function toIcsDate(iso: string): string {
  // ICS butuh format YYYYMMDDTHHMMSS. Kita perlakukan input sebagai waktu lokal (WIB),
  // jadi ditulis apa adanya tanpa 'Z' supaya kalender tamu tidak menggesernya ke UTC.
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "").replace(/Z$/, "");
}

function escapeIcsText(text: string): string {
  return text.replace(/[\\,;]/g, (match) => "\\" + match).replace(/\n/g, "\\n");
}

export function buildIcs(event: IcsEvent): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Undangan Pernikahan//ID",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${toIcsDate(event.start)}`,
    `DTEND:${toIcsDate(event.end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    event.location ? `LOCATION:${escapeIcsText(event.location)}` : null,
    event.description ? `DESCRIPTION:${escapeIcsText(event.description)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}
