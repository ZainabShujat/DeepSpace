import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

declare global {
  // eslint-disable-next-line no-var
  var __supabase_client: SupabaseClient | undefined;
}

export function createClient(): SupabaseClient {
  // Prefer a global cache to avoid multiple client instances when module duplication occurs
  if (typeof globalThis !== "undefined" && (globalThis as any).__supabase_client) {
    return (globalThis as any).__supabase_client as SupabaseClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const client = createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
    },
  });

  if (typeof globalThis !== "undefined") {
    (globalThis as any).__supabase_client = client;
  }

  return client;
}

export default createClient;
