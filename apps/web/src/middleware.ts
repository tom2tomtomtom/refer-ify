import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Only run on protected app routes
  const protectedPrefixes = ['/referrals', '/client'];
  if (!protectedPrefixes.some(p => pathname.startsWith(p))) return NextResponse.next();

  // Read role cookie set by app (fallback to null)
  const role = req.cookies.get('dev_role_override')?.value || req.cookies.get('role')?.value || null;

  // Redirect clients away from circle dashboard
  if (pathname.startsWith('/referrals') && role === 'client') {
    return NextResponse.redirect(new URL('/candidates', req.url));
  }

  // Redirect circle members away from client routes
  if (pathname.startsWith('/client') && (role === 'select_circle' || role === 'select' || role === 'founding_circle' || role === 'founding')) {
    return NextResponse.redirect(new URL('/referrals', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/referrals/:path*', '/client/:path*'],
};


