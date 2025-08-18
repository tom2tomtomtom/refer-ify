import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: { path?: string; domain?: string; httpOnly?: boolean; secure?: boolean; sameSite?: "strict" | "lax" | "none"; maxAge?: number; expires?: Date }) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: { path?: string; domain?: string }) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });
}

// Use this in Server Components (e.g., layout.tsx, page.tsx) to AVOID modifying cookies
// Next.js 15 restricts cookie mutations to Route Handlers or Server Actions.
export async function getSupabaseServerComponentClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set() {
        // no-op in Server Components
      },
      remove() {
        // no-op in Server Components
      },
    },
  });
}


