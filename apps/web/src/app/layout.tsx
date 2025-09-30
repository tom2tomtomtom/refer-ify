import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { DevRoleSwitcher } from "@/components/dev/DevRoleSwitcher";
import { DemoRoleSwitcherSimple } from "@/components/dev/DemoRoleSwitcherSimple";
import { DemoNavigationBar } from "@/components/dev/DemoNavigationBar";
import { SignOutButton } from "@/components/navigation/SignOutButton";
import { Briefcase, Star, Users, User } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Refer-ify | Executive Recruitment Network",
  description: "AI-powered executive recruitment platform connecting elite professionals with top opportunities through trusted referrals.",
  keywords: ["executive recruitment", "referrals", "job opportunities", "AI-powered matching", "professional network"],
  openGraph: {
    title: "Refer-ify | Executive Recruitment Network",
    description: "AI-powered executive recruitment platform connecting elite professionals with top opportunities",
    type: "website",
  },
};

type SupportedRole = "client" | "founding" | "select" | null;

interface NavItem {
  label: string;
  href: string;
}

interface Navigation {
  items: NavItem[];
  cta: { label: string; href: string };
  roleLabel?: string;
}

function normalizeRole(role: string | null): SupportedRole {
  if (!role) return null;
  const r = role.toLowerCase();
  if (r === "client") return "client";
  if (r === "founding" || r === "founding_circle") return "founding";
  if (r === "select" || r === "select_circle") return "select";
  return null;
}

function getNavigationForRole(role: SupportedRole, hasClientJobs?: boolean): Navigation {
  if (role === "client") {
    return {
      items: [
        { label: "Dashboard", href: "/client" },
        { label: "Jobs", href: "/client/jobs" },
        { label: "Candidates", href: "/client/candidates" },
        { label: "Analytics", href: "/client/analytics" },
        { label: "Billing", href: "/client/billing" },
      ],
      cta: hasClientJobs
        ? { label: "View Jobs", href: "/client/jobs" }
        : { label: "Post Job", href: "/client/jobs/new" },
      roleLabel: "Client Company",
    };
  }
  if (role === "founding") {
    return {
      items: [
        { label: "Dashboard", href: "/founding" },
        { label: "Network Growth", href: "/founding/network" },
        { label: "Revenue", href: "/founding/revenue" },
        { label: "My Referrals", href: "/founding/referrals" },
        { label: "Invite Members", href: "/founding/invite" },
        { label: "Advisory", href: "/founding/advisory" },
      ],
      cta: { label: "View Network", href: "/founding/network" },
      roleLabel: "Founding Circle",
    };
  }
  if (role === "select") {
    return {
      items: [
        { label: "Dashboard", href: "/select-circle" },
        { label: "Browse Jobs", href: "/select-circle/job-opportunities" },
        { label: "My Referrals", href: "/select-circle/referrals" },
        { label: "Earnings", href: "/select-circle/earnings" },
        { label: "Network", href: "/select-circle/network" },
      ],
      cta: { label: "Find Jobs", href: "/select-circle/job-opportunities" },
      roleLabel: "Select Circle",
    };
  }
  // Anonymous
  return {
    items: [
      { label: "How It Works", href: "/how-it-works" },
      { label: "For Companies", href: "/for-companies" },
      { label: "Join Network", href: "/join-network" },
      { label: "About", href: "/about" },
    ],
    cta: { label: "Request Invitation", href: "/apply" },
  };
}

function getRoleStyles(role: SupportedRole) {
  switch (role) {
    case 'client':
      return 'bg-green-100 text-green-700';
    case 'founding':
      return 'bg-amber-100 text-amber-700';
    case 'select':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function RoleIcon({ role }: { role: SupportedRole }) {
  if (role === 'client') return <Briefcase className="w-3 h-3" />;
  if (role === 'founding') return <Star className="w-3 h-3" />;
  if (role === 'select') return <Users className="w-3 h-3" />;
  return <User className="w-3 h-3" />;
}

function getRoleLabel(role: SupportedRole) {
  if (role === 'client') return 'Client Company';
  if (role === 'founding') return 'Founding Circle';
  if (role === 'select') return 'Select Circle';
  return 'User';
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Production-first approach: Always render anonymous navigation to prevent 500 errors
  // Individual pages will handle auth and user-specific content
  let headerRole: string | null = null;
  let userId: string | null = null;
  let hasClientJobs = false;

  // Check for demo mode first (works in both dev and production)
  try {
    const cookieStore = await cookies();
    const devOverride = cookieStore.get('dev_role_override')?.value;
    if (devOverride) {
      headerRole = devOverride;
    }
  } catch {}

  // In production, skip complex database queries to prevent timeouts and 500 errors
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!isProduction) {
    // Only do database auth resolution in development
    const hasRequiredEnvVars = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                               process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (hasRequiredEnvVars) {
      // Only query database if no demo override exists
      if (!headerRole) {
        try {
          const supabase = await getSupabaseServerComponentClient();
          const { data: { user }, error } = await supabase.auth.getUser();
          if (user && !error) {
            userId = user.id;
            // Combine user profile and job count queries for efficiency
            const [profileResult, jobCountResult] = await Promise.allSettled([
              supabase.from("profiles").select("role").eq("id", user.id as unknown as string).single(),
              supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('client_id', userId)
            ]);

            if (profileResult.status === 'fulfilled' && profileResult.value.data) {
              headerRole = profileResult.value.data.role;
            }

            if (jobCountResult.status === 'fulfilled' && jobCountResult.value.count) {
              hasClientJobs = jobCountResult.value.count > 0;
            }
          }
        } catch (error) {
          // Fail gracefully - render anonymous navigation
          console.warn('Failed to resolve user role:', error);
        }
      }
    }
  }

  const normalizedRole = normalizeRole(headerRole);
  const navigation = getNavigationForRole(normalizedRole, hasClientJobs);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {process.env.NODE_ENV === 'development' && (
          <DemoNavigationBar currentRole={headerRole} />
        )}
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Link href="/" className="font-semibold tracking-tight">Refer-ify</Link>
              {normalizedRole && (
                <span className="hidden sm:inline-flex items-center gap-2">
                  {process.env.NODE_ENV !== 'production' && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">DEMO</span>
                  )}
                  <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium ${getRoleStyles(normalizedRole)}`}>
                    <RoleIcon role={normalizedRole} /> {getRoleLabel(normalizedRole)}
                  </span>
                </span>
              )}
            </div>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              {navigation.items.map((item, idx) => (
                <Link key={`${item.href}-${item.label}-${idx}`} href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              ))}
              {normalizedRole !== null ? (
                <SignOutButton />
              ) : (
                <Link href="/login" className="hover:text-foreground font-medium">Sign In</Link>
              )}
            </nav>
            <div className="flex items-center gap-3">
              <Link href={navigation.cta.href}>
                <Button className="bg-black text-white hover:opacity-90">{navigation.cta.label}</Button>
              </Link>
            </div>
          </div>
        </header>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <DevRoleSwitcher currentRole={headerRole}
          />
        )}
        {/* Simple demo switcher for production CEO demo */}
        {normalizedRole !== null && (
          <DemoRoleSwitcherSimple />
        )}
        <Toaster />
      </body>
    </html>
  );
}
