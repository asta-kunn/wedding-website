export type Lang = "id" | "en";
export const LANG_STORAGE_KEY = "invitation-lang";
export const DEFAULT_LANG: Lang = "id";

export const DICT = {
  openInvitation: { id: "Buka Undangan", en: "Open Invitation" },
  invitedTo: { id: "Kepada Yth.", en: "Dear" },
  generalGuest: { id: "Tamu Undangan", en: "Guest" },
  scrollHint: { id: "Ketuk untuk membuka", en: "Tap to open" },
  ourStory: { id: "Kisah Kami", en: "Our Story" },
  couple: { id: "Mempelai", en: "The Couple" },
  sonOf: { id: "Putra dari", en: "Son of" },
  daughterOf: { id: "Putri dari", en: "Daughter of" },
  eventDetail: { id: "Detail Acara", en: "Event Details" },
  viewLocation: { id: "Lihat Lokasi", en: "View Location" },
  saveToCalendar: { id: "Simpan ke Kalender", en: "Save to Calendar" },
  countdownTitle: { id: "Menuju Hari Bahagia", en: "Counting Down" },
  days: { id: "Hari", en: "Days" },
  hours: { id: "Jam", en: "Hours" },
  minutes: { id: "Menit", en: "Minutes" },
  seconds: { id: "Detik", en: "Seconds" },
  gallery: { id: "Galeri", en: "Gallery" },
  qrTitle: { id: "QR Check-in Kamu", en: "Your Check-in QR" },
  qrDesc: {
    id: "Tunjukkan layar ini ke penerima tamu saat tiba di lokasi acara.",
    en: "Show this screen to the greeter when you arrive at the venue.",
  },
  qrGuestCount: { id: "orang", en: "guest(s)" },
  saveQr: { id: "Simpan QR", en: "Save QR" },
  rsvpTitle: { id: "RSVP & Ucapan", en: "RSVP & Wishes" },
  rsvpName: { id: "Nama", en: "Name" },
  rsvpAttendance: { id: "Konfirmasi Kehadiran", en: "Attendance" },
  attendYes: { id: "Hadir", en: "Attending" },
  attendNo: { id: "Tidak Hadir", en: "Not Attending" },
  attendMaybe: { id: "Masih Ragu", en: "Maybe" },
  rsvpPax: { id: "Jumlah orang", en: "Number of guests" },
  rsvpMessage: { id: "Ucapan & Doa", en: "Message & Wishes" },
  rsvpSubmit: { id: "Kirim", en: "Submit" },
  rsvpSent: { id: "Terima kasih atas konfirmasinya!", en: "Thank you for your confirmation!" },
  closingTitle: { id: "Terima Kasih", en: "Thank You" },
  muteMusic: { id: "Matikan musik", en: "Mute music" },
  playMusic: { id: "Putar musik", en: "Play music" },
} as const;

export type DictKey = keyof typeof DICT;

export function t(key: DictKey, lang: Lang): string {
  return DICT[key][lang];
}
