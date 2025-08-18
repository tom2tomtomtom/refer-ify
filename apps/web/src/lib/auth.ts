import { redirect } from "next/navigation";
import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/database.types";

export async function getCurrentUser() {
  const supabase = await getSupabaseServerComponentClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
}

export async function requireAuth(redirectTo: string = "/login") {
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo);
  return user;
}

export async function requireRole(roles: UserRole[] | UserRole, redirectTo?: string) {
  const supabase = await getSupabaseServerComponentClient();
  const user = await requireAuth(redirectTo);
  if (!user) {
    redirect(redirectTo ?? "/");
    return undefined as never; // This will never execute but satisfies TypeScript
  }
  const roleList = Array.isArray(roles) ? roles : [roles];
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!data || !data.role || !roleList.includes(data.role)) {
    redirect(redirectTo ?? "/");
    return undefined as never; // This will never execute but satisfies TypeScript
  }
  return { user, role: data.role } as const;
}


