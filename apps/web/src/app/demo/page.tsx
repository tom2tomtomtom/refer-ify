"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Star, Users, User, ArrowRight } from "lucide-react";

export default function DemoSwitcherPage() {
  const setDemoRole = (role: "founding" | "select" | "client" | "candidate") => {
    // Clear existing cookies
    document.cookie = 'dev_role_override=; Max-Age=0; Path=/; SameSite=Lax';
    document.cookie = 'demo_user_role=; Max-Age=0; Path=/; SameSite=Lax';
    
    try {
      window.localStorage.removeItem('demo_user_role');
      window.localStorage.removeItem('dev_role_override');
    } catch {}
    
    // Set new role
    document.cookie = `dev_role_override=${role}; Max-Age=${60 * 60 * 24 * 7}; Path=/; SameSite=Lax`;
    
    try {
      window.localStorage.setItem('demo_user_role', role);
      window.localStorage.setItem('dev_role_override', role);
    } catch {}
    
    // Navigate
    const redirect = role === "founding" ? "/founding-circle" : 
                     role === "select" ? "/select-circle" : 
                     role === "candidate" ? "/candidate" : "/client";
    window.location.href = redirect;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-2">🎭 Demo Mode - Choose Your Role</CardTitle>
          <CardDescription className="text-base">
            Explore Refer-ify from different user perspectives. Click any role below to start.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setDemoRole("client")}
              className="h-auto py-6 flex flex-col items-start gap-2 hover:bg-green-50 hover:border-green-500"
            >
              <div className="flex items-center gap-2 font-semibold text-base">
                <Briefcase className="w-5 h-5 text-green-600" />
                Client Company
              </div>
              <div className="text-sm text-left text-muted-foreground">
                View the hiring manager experience. Post jobs, review candidates, track analytics.
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                Explore Client View <ArrowRight className="w-3 h-3" />
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setDemoRole("founding")}
              className="h-auto py-6 flex flex-col items-start gap-2 hover:bg-amber-50 hover:border-amber-500"
            >
              <div className="flex items-center gap-2 font-semibold text-base">
                <Star className="w-5 h-5 text-amber-600" />
                Founding Circle
              </div>
              <div className="text-sm text-left text-muted-foreground">
                Network leader experience. Track revenue, manage network, view growth metrics.
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                Explore Founding View <ArrowRight className="w-3 h-3" />
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setDemoRole("select")}
              className="h-auto py-6 flex flex-col items-start gap-2 hover:bg-blue-50 hover:border-blue-500"
            >
              <div className="flex items-center gap-2 font-semibold text-base">
                <Users className="w-5 h-5 text-blue-600" />
                Select Circle
              </div>
              <div className="text-sm text-left text-muted-foreground">
                Referrer experience. Browse jobs, track earnings, submit referrals.
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                Explore Select View <ArrowRight className="w-3 h-3" />
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setDemoRole("candidate")}
              className="h-auto py-6 flex flex-col items-start gap-2 hover:bg-purple-50 hover:border-purple-500"
            >
              <div className="flex items-center gap-2 font-semibold text-base">
                <User className="w-5 h-5 text-purple-600" />
                Candidate
              </div>
              <div className="text-sm text-left text-muted-foreground">
                Job seeker experience. Track applications and interview status.
              </div>
              <div className="flex items-center gap-1 text-xs text-purple-600 font-medium">
                Explore Candidate View <ArrowRight className="w-3 h-3" />
              </div>
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-center text-gray-700">
              <strong>💡 Tip:</strong> To switch between roles, bookmark this page:<br/>
              <code className="bg-white px-2 py-1 rounded text-xs">[YOUR-URL]/demo</code><br/>
              Or click "Sign Out" to return here.
            </p>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <a href="/" className="underline hover:text-foreground">Return to Homepage</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const dynamic = "force-dynamic";
