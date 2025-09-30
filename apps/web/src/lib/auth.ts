import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/database.types";

// Demo mode check - now works in production too for CEO demo
async function isDemoMode() {
  try {
    const cookieStore = await cookies();
    return !!cookieStore.get('dev_role_override')?.value;
  } catch {
    return false;
  }
}

// Get demo role from cookies
async function getDemoRole(): Promise<UserRole | null> {
  try {
    const cookieStore = await cookies();
    const demoRole = cookieStore.get('dev_role_override')?.value;
    if (demoRole && ['client', 'founding', 'founding_circle', 'select', 'select_circle', 'candidate'].includes(demoRole)) {
      // Normalize role names
      if (demoRole === 'founding') return 'founding_circle';
      if (demoRole === 'select') return 'select_circle';
      return demoRole as UserRole;
    }
    return null;
  } catch {
    return null;
  }
}

// Create demo user object
function createDemoUser(role: UserRole) {
  return {
    id: `demo-${role}-user`,
    email: `demo-${role}@refer-ify.com`,
    app_metadata: { role },
    user_metadata: { 
      name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      demo: true 
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  };
}

export async function getCurrentUser() {
  // Check for demo mode first
  if (await isDemoMode()) {
    const demoRole = await getDemoRole();
    if (demoRole) {
      return createDemoUser(demoRole);
    }
  }

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
  // Check for demo mode first
  if (await isDemoMode()) {
    const demoRole = await getDemoRole();
    const roleList = Array.isArray(roles) ? roles : [roles];
    
    if (demoRole && roleList.includes(demoRole)) {
      return { 
        user: createDemoUser(demoRole), 
        role: demoRole 
      } as const;
    } else {
      // Demo mode but wrong role - redirect to homepage instead of login
      redirect("/");
      return undefined as never;
    }
  }

  // Regular auth flow
  const supabase = await getSupabaseServerComponentClient();
  const user = await requireAuth(redirectTo);
  if (!user) {
    redirect(redirectTo ?? "/");
    return undefined as never;
  }
  const roleList = Array.isArray(roles) ? roles : [roles];
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!data || !data.role || !roleList.includes(data.role)) {
    redirect(redirectTo ?? "/");
    return undefined as never;
  }
  return { user, role: data.role } as const;
}


