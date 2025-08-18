'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, Briefcase, Star, User, RotateCcw, Settings } from 'lucide-react';

export type DevRole = 'visitor' | 'client' | 'founding' | 'select';

interface DevRoleSwitcherProps {
  currentRole: string | null;
}

const ROLE_META: Record<DevRole, { label: string; icon: React.ComponentType<{ className?: string }>; classes: string }> = {
  visitor: { label: 'Visitor', icon: User, classes: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  client: { label: 'Client', icon: Briefcase, classes: 'bg-green-100 text-green-700 hover:bg-green-200' },
  founding: { label: 'Founding', icon: Star, classes: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
  select: { label: 'Select', icon: Users, classes: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
};

function setDevOverrideCookie(role: DevRole | null) {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  if (role) {
    document.cookie = `dev_role_override=${role}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
  } else {
    // Expire cookie
    document.cookie = `dev_role_override=; Max-Age=0; Path=/; SameSite=Lax`;
  }
}

export function DevRoleSwitcher({ currentRole }: DevRoleSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [devRole, setDevRole] = useState<DevRole | null>(null);

  const isOverrideActive = useMemo(() => devRole !== null, [devRole]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('dev_role_override');
      if (stored === 'visitor' || stored === 'client' || stored === 'founding' || stored === 'select') {
        setDevRole(stored);
      }
    } catch {}
  }, []);

  // Keyboard shortcut: Ctrl+Shift+R toggles panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'R' || e.key === 'r')) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const applyRole = useCallback((role: DevRole) => {
    try {
      window.localStorage.setItem('dev_role_override', role);
      setDevOverrideCookie(role);
    } catch {}
    // Force reload so SSR picks up cookie override
    window.location.reload();
  }, []);

  const resetRole = useCallback(() => {
    try {
      window.localStorage.removeItem('dev_role_override');
      setDevOverrideCookie(null);
    } catch {}
    window.location.reload();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-black/70 text-white px-3 py-1 text-xs backdrop-blur hover:bg-black/80"
          title="Open Dev Role Switcher (Ctrl+Shift+R)"
        >
          DEV
        </button>
      ) : (
        <div className="w-[300px] rounded-xl border bg-white/80 backdrop-blur shadow-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <Settings className="h-4 w-4" />
              <span>Dev Role Switcher</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-xs text-gray-500 hover:text-gray-700">Close</button>
          </div>

          <div className="mt-2 rounded bg-gray-50 p-2 text-[11px] text-gray-700">
            <div>Actual role: <span className="font-medium">{currentRole ?? 'visitor'}</span></div>
            <div>Override: <span className={isOverrideActive ? 'text-blue-700 font-medium' : 'text-gray-500'}>{isOverrideActive ? devRole : 'none'}</span></div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {(Object.keys(ROLE_META) as DevRole[]).map((role) => {
              const Meta = ROLE_META[role];
              const Icon = Meta.icon;
              return (
                <button
                  key={role}
                  onClick={() => applyRole(role)}
                  className={`flex items-center justify-center gap-2 rounded px-2 py-2 text-xs transition ${Meta.classes}`}
                >
                  <Icon className="h-4 w-4" /> {Meta.label}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={resetRole}
              className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset to Actual Role
            </button>
            <div className="text-[10px] text-gray-500">Ctrl+Shift+R</div>
          </div>
        </div>
      )}
    </div>
  );
}


