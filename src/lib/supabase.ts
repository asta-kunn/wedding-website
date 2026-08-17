import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type { Guest, GiftType, Stats } from "@/lib/guest";

let client: SupabaseClient | null = null;

/**
 * Klien khusus server. Memakai service_role key sehingga melewati RLS.
 * Dibuat saat pertama dipakai, bukan saat modul diimpor, supaya proses
 * build tidak gagal hanya karena environment variable belum tersedia.
 * Jangan pernah mengimpor file ini dari komponen client.
 */
export function getDb(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi di environment variable."
    );
  }

  client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
