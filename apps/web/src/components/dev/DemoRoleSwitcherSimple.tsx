'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User, Briefcase, Star, Users } from "lucide-react";

export function DemoRoleSwitcherSimple() {
  const handleRoleSwitch = (role: string) => {
    // Clear existing demo cookies
    document.cookie = 'dev_role_override=; Max-Age=0; Path=/; SameSite=Lax';
    document.cookie = 'demo_user_role=; Max-Age=0; Path=/; SameSite=Lax';
    
    if (role === 'logout') {
      // Clear everything and go to login
      try {
        window.localStorage.removeItem('demo_user_role');
        window.localStorage.removeItem('dev_role_override');
      } catch {}
      window.location.href = '/login';
      return;
    }
    
    // Set new role
    document.cookie = `dev_role_override=${role}; Max-Age=604800; Path=/; SameSite=Lax`;
    
    try {
      window.localStorage.setItem('demo_user_role', role);
      window.localStorage.setItem('dev_role_override', role);
    } catch {}
    
    // Navigate to appropriate dashboard
    const paths: Record<string, string> = {
      'client': '/client',
      'founding': '/founding-circle',
      'founding_circle': '/founding-circle',
      'select': '/select-circle',
      'select_circle': '/select-circle',
      'candidate': '/candidate'
    };
    
    window.location.href = paths[role] || '/';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border-2 border-blue-500 rounded-lg shadow-xl p-4 max-w-xs">
      <div className="text-xs font-semibold mb-2 text-blue-600">🎭 DEMO MODE - Quick Switch</div>
      
      <div className="space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleRoleSwitch('client')}
          className="w-full justify-start text-xs"
        >
          <Briefcase className="w-3 h-3 mr-2" />
          Client Company
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleRoleSwitch('founding')}
          className="w-full justify-start text-xs"
        >
          <Star className="w-3 h-3 mr-2" />
          Founding Circle
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleRoleSwitch('select')}
          className="w-full justify-start text-xs"
        >
          <Users className="w-3 h-3 mr-2" />
          Select Circle
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleRoleSwitch('candidate')}
          className="w-full justify-start text-xs"
        >
          <User className="w-3 h-3 mr-2" />
          Candidate
        </Button>
        
        <div className="border-t pt-2 mt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleRoleSwitch('logout')}
            className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Exit Demo Mode
          </Button>
        </div>
      </div>
    </div>
  );
}
