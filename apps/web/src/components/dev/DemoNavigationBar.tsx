'use client';

import { Button } from "@/components/ui/button";
import { User, Briefcase, Star, Users } from "lucide-react";

interface DemoNavigationBarProps {
  currentRole?: string | null;
}

export function DemoNavigationBar({ currentRole }: DemoNavigationBarProps) {
  const handleRoleSwitch = (role: string, path: string) => {
    // Set role override cookie
    document.cookie = `dev_role_override=${role}; Max-Age=604800; Path=/; SameSite=Lax`;
    
    // Also set localStorage for immediate client-side role switching
    try {
      window.localStorage.setItem('demo_user_role', role);
      window.localStorage.setItem('dev_role_override', role);
    } catch {}
    
    // Navigate to the appropriate authenticated dashboard
    window.location.href = path;
  };

  const getRoleLabel = (role: string | null) => {
    if (!role) return 'Visitor';
    if (role === 'client') return 'Client Company';
    if (role === 'founding') return 'Founding Circle';
    if (role === 'select') return 'Select Circle';
    return 'User';
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-50 to-blue-50 border-b border-amber-200 py-2">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">🎭 DEMO MODE - Quick Switch:</span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleRoleSwitch('visitor', '/')}
                className="h-7 text-xs bg-gray-100 hover:bg-gray-200 border-gray-300"
              >
                <User className="w-3 h-3 mr-1" />
                Visitor
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleRoleSwitch('client', '/client')}
                className="h-7 text-xs bg-green-100 hover:bg-green-200 border-green-300 text-green-700"
              >
                <Briefcase className="w-3 h-3 mr-1" />
                Client
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleRoleSwitch('founding', '/founding-circle')}
                className="h-7 text-xs bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-700"
              >
                <Star className="w-3 h-3 mr-1" />
                Founding
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleRoleSwitch('select', '/select-circle')}
                className="h-7 text-xs bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-700"
              >
                <Users className="w-3 h-3 mr-1" />
                Select
              </Button>
            </div>
          </div>
          <span className="text-xs text-gray-500">Current: {getRoleLabel(currentRole)}</span>
        </div>
      </div>
    </div>
  );
}