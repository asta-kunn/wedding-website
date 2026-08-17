# Buku Tamu — Pencatat Kehadiran Undangan

Aplikasi admin untuk penerima tamu di pintu masuk resepsi. Petugas memindai QR di undangan,
mengisi jumlah orang yang datang, lalu memilih hadiahnya amplop atau transfer. Semuanya tercatat
di satu tabel.

## Stack

| Bagian | Pilihan | Alasan |
|---|---|---|
| Frontend + backend | Next.js 14 (App Router) | satu repo, route handler jadi backend, cocok untuk Vercel |
| Database | Supabase Postgres | gratis, `unique` bawaan Postgres yang menjaga anti-duplikat |
| Gaya | Tailwind CSS | tidak ada CSS runtime, bundel kecil |
| Pemindai QR | `html5-qrcode` | jalan di kamera ponsel lewat browser, tanpa aplikasi tambahan |
| Baca/tulis Excel | `xlsx` (SheetJS) | dijalankan di browser, server tidak perlu memproses file |
| Pembuat QR | `qrcode` | menghasilkan PNG di browser, siap dicetak |

Tidak ada server yang perlu dijaga. Fungsi API berjalan sebagai serverless function di Vercel.

## 1. Siapkan database

Buka project Supabase → **SQL Editor** → tempel seluruh isi `supabase/schema.sql` → **Run**.

Skrip itu membuat tabel `guests` berikut aturannya:

- `phone` **unik** → ini kunci anti-duplikat. Nomor yang sudah ada akan ditimpa, bukan digandakan.
- `code` terisi otomatis `INV-0001`, `INV-0002`, … → isi QR tiap tamu.
- `attended`, `pax`, `gift_type`, `note`, `checked_in_at`, `checked_in_by` → catatan di pintu masuk.
- RLS menyala tanpa policy → browser tidak bisa menyentuh tabel. Semua akses lewat API server.

## 2. Isi environment variable

Salin `.env.example` menjadi `.env.local`, lalu isi:

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...        # Project Settings > API > service_role
ADMIN_PIN=214365                     # PIN yang dipakai petugas untuk masuk
AUTH_SECRET=...                      # openssl rand -base64 32
NEXT_PUBLIC_INVITE_BASE=             # opsional, alamat undangan digital
```

`service_role` key memegang akses penuh ke database. Simpan hanya di environment variable server,
jangan pernah ditulis di kode frontend atau dipakai dengan awalan `NEXT_PUBLIC_`.

## 3. Jalankan di komputer

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Kamera browser hanya aktif di `localhost` atau HTTPS — di jaringan
lokal lewat alamat IP, kamera akan diblokir browser.

## 4. Deploy ke Vercel

```bash
npx vercel
```

Atau hubungkan repo Git ke Vercel. Setelah itu masukkan keempat environment variable di
**Project → Settings → Environment Variables**, lalu deploy ulang. Domain Vercel sudah HTTPS,
jadi kamera langsung bisa dipakai.

## Alur pemakaian

**Sebelum hari H**

1. Menu **Impor** → **Unduh template Excel** → dapat file dengan kolom `nama` dan `no_hp`.
2. Isi daftar tamu, unggah lagi. Pratinjau menandai baris yang siap, yang nomornya ganda,
   dan yang ditolak. Tekan simpan.
3. Menu **Kartu QR** → **Buat kartu QR**. Unduh PNG per tamu untuk ditempel di undangan digital,
   atau tekan cetak untuk lembar A4 berisi sembilan kartu per halaman.

**Di pintu masuk**

1. Petugas buka situs, masukkan PIN, isi namanya sekali (tersimpan di ponsel itu).
2. Nyalakan kamera, pindai QR tamu.
3. Kartu tamu muncul: atur jumlah orang, pilih **Amplop / Transfer / Tidak ada**, simpan.
   Cap "HADIR" muncul, lalu pemindai siap untuk tamu berikutnya.
4. QR rusak atau tamu lupa undangan? Kolom pencarian di bawah kamera menerima kode, nomor HP,
   atau nama.

**Setelah acara**

Menu **Tamu** → **Unduh CSV** untuk rekap lengkap: kehadiran, jumlah orang, jenis hadiah,
catatan, waktu, dan nama petugas yang mencatat.

## Aturan anti-duplikat

Nomor HP dipakai sebagai identitas tamu dan diseragamkan dulu sebelum disimpan, jadi
`0812-3456-7890`, `+62 812 3456 7890`, dan `62812345678 90` dianggap satu orang yang sama
(`628123456789`).

- Nomor ganda **di dalam satu file Excel**: baris paling bawah yang dipakai.
- Nomor yang **sudah ada di database**: namanya ditimpa dengan yang baru. Kode undangan dan
  catatan kehadiran tidak berubah, sehingga kartu QR yang sudah dicetak tetap berlaku.

## Catatan teknis

- Pemindai menerima QR berisi kode polos (`INV-0007`) maupun URL undangan
  (`https://undangan-kami.com/?to=INV-0007`). Kode diambil otomatis dari keduanya.
- Login memakai satu PIN bersama dan cookie bertanda tangan HMAC yang berlaku 12 jam.
  Cukup untuk beberapa petugas di satu acara; kalau butuh akun terpisah per petugas,
  ganti dengan Supabase Auth.
- Endpoint API memuat seluruh tabel sekali jalan, dibatasi 5.000 baris. Untuk skala segini
  tidak perlu penomoran halaman.
- Tombol "batalkan" dan "hapus" di menu Tamu ada untuk memperbaiki kesalahan input.
  Menghapus tamu membuat kartu QR yang sudah dicetak tidak berlaku lagi.

## Struktur berkas

```
supabase/schema.sql          skema database
middleware.ts                penjaga sesi untuk semua halaman dan API
src/lib/auth.ts              cookie sesi bertanda tangan HMAC
src/lib/supabase.ts          klien database service_role
src/lib/guest.ts             normalisasi nomor, pembacaan kode QR, format tampilan
src/app/api/lookup           cari tamu dari hasil pindai
src/app/api/checkin          catat kehadiran
src/app/api/import           impor massal dengan aturan timpa
src/app/api/export           rekap CSV
src/app/(app)/scan           pemindai kamera
src/app/(app)/guests         tabel kehadiran
src/app/(app)/import         unggah Excel
src/app/(app)/qr             pembuat kartu QR
src/components/CheckInSheet  panel konfirmasi di pintu masuk
```
