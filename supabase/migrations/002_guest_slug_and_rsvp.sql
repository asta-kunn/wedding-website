-- =========================================================
--  Migration 002 — slug link personal + RSVP tamu
--  Jalankan di Supabase > SQL Editor. Aman dijalankan di
--  database yang sudah berisi data (additive, tidak mengubah
--  kolom/tabel yang sudah ada).
-- =========================================================

-- ---------- slug untuk link undangan personal ----------
alter table public.guests add column if not exists slug text;

create or replace function public.make_guest_slug(guest_name text)
returns text
language plpgsql
as $$
declare
  base text;
  candidate text;
  tries int := 0;
begin
  base := lower(regexp_replace(coalesce(guest_name, 'tamu'), '[^a-zA-Z0-9]+', '-', 'g'));
  base := trim(both '-' from base);
  if base = '' then base := 'tamu'; end if;
  base := left(base, 40);

  loop
    candidate := base || '-' || substr(encode(gen_random_bytes(4), 'hex'), 1, 6);
    exit when not exists (select 1 from public.guests where slug = candidate);
    tries := tries + 1;
    exit when tries > 20; -- praktis mustahil, tapi jaga-jaga agar tidak infinite loop
  end loop;

  return candidate;
end;
$$;

create or replace function public.guests_set_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := public.make_guest_slug(new.name);
  end if;
  return new;
end;
$$;

drop trigger if exists guests_set_slug on public.guests;
create trigger guests_set_slug
  before insert on public.guests
  for each row execute function public.guests_set_slug();

-- Backfill tamu yang sudah ada sebelum migration ini.
update public.guests set slug = public.make_guest_slug(name) where slug is null;

alter table public.guests alter column slug set not null;
create unique index if not exists guests_slug_idx on public.guests (slug);

-- ---------- RSVP & ucapan tamu ----------
create table if not exists public.rsvps (
  id          uuid primary key default gen_random_uuid(),
  guest_id    uuid references public.guests(id) on delete set null,
  name        text not null,
  attendance  text not null check (attendance in ('hadir', 'tidak_hadir', 'ragu')),
  pax         integer,
  message     text,
  created_at  timestamptz not null default now()
);

create index if not exists rsvps_created_at_idx on public.rsvps (created_at desc);

-- Sama seperti guests: RLS aktif tanpa policy, hanya bisa diakses
-- lewat API server (service_role key).
alter table public.rsvps enable row level security;
