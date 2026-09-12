/**
 * Preset warna undangan. Ganti baris ACTIVE_THEME untuk menukar palet
 * di seluruh halaman /to — semua warna didefinisikan sebagai CSS variable
 * di src/app/to/invitation.css, file ini hanya menentukan preset mana yang aktif.
 */
export const THEMES = ["monochrome", "warm", "vintage"] as const;
export type ThemeName = (typeof THEMES)[number];

// vintage = samakan dulu dengan referensi jsambac.com/tema-19 (coklat tua + biru dusty).
export const ACTIVE_THEME: ThemeName = "vintage";
