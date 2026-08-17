-- =========================================================
--  Wedding Check-in — skema database
--  Jalankan seluruh isi file ini di Supabase > SQL Editor.
-- =========================================================

create extension if not exists pgcrypto;

-- Nomor urut untuk kode undangan (INV-0001, INV-0002, ...)
create sequence if not exists guest_code_seq start 1;

create table if not exists public.guests (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique
                default ('INV-' || lpad(nextval('guest_code_seq')::text, 4, '0')),
  name          text not null,
  phone         text not null unique,          -- disimpan ternormalisasi: 6281234567890
  attended      boolean not null default false,
  pax           integer,                       -- jumlah orang yang benar-benar datang
  gift_type     text check (gift_type in ('amplop', 'transfer', 'tidak_ada')),
  note          text,
  checked_in_at timestamptz,
  checked_in_by text,                          -- nama petugas penerima tamu
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists guests_attended_idx   on public.guests (attended);
create index if not exists guests_created_at_idx  on public.guests (created_at desc);
create index if not exists guests_name_lower_idx  on public.guests (lower(name));

-- updated_at otomatis
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists guests_touch_updated_at on public.guests;
create trigger guests_touch_updated_at
  before update on public.guests
  for each row execute function public.touch_updated_at();

-- =========================================================
--  Keamanan: RLS aktif tanpa policy apa pun.
--  Artinya anon key / browser TIDAK bisa baca-tulis tabel ini.
--  Semua akses hanya lewat API server Next.js yang memakai
--  service_role key (disimpan di environment variable Vercel).
-- =========================================================
alter table public.guests enable row level security;

-- Contoh data (hapus kalau tidak perlu)
-- insert into public.guests (name, phone) values
--   ('Budi Santoso', '628123456789'),
--   ('Siti Aminah',  '628987654321')
-- on conflict (phone) do update set name = excluded.name;
