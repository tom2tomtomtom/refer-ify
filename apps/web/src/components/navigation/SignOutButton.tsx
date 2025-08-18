'use client';

import { LogOut } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
  const handleSignOut = async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        const demoRole = typeof window !== 'undefined' ? window.localStorage.getItem('demo_user_role') : null;
        const devOverride = typeof window !== 'undefined' ? window.localStorage.getItem('dev_role_override') : null;
        if (demoRole) {
          window.localStorage.removeItem('demo_user_role');
          document.cookie = `demo_user_role=; Max-Age=0; Path=/; SameSite=Lax`;
        }
        if (devOverride) {
          window.localStorage.removeItem('dev_role_override');
          document.cookie = `dev_role_override=; Max-Age=0; Path=/; SameSite=Lax`;
        }
      }
    } catch {}

    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className={className || 'text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center gap-1'}
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  );
}


