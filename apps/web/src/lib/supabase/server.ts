import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";
import { optimizeSupabaseClient, withTimeout } from "@/lib/performance";

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const client = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options });
      },
    } as any,
    global: {
      headers: {
        'X-Client-Info': 'refer-ify-server@1.0.0',
      },
    },
    db: {
      schema: 'public',
    }
  } as any);
  
  return optimizeSupabaseClient(client);
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

  const client = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
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
    global: {
      headers: {
        'X-Client-Info': 'refer-ify-server-component@1.0.0',
      },
    },
    db: {
      schema: 'public',
    }
  });
  
  return optimizeSupabaseClient(client);
}


