import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseServiceClient } from '@/lib/supabase/service';

// Demo user IDs for each role
const DEMO_USERS = {
  founding: '00000000-0000-0000-0000-000000000001',
  select: '00000000-0000-0000-0000-000000000002',
  client: '00000000-0000-0000-0000-000000000003',
  candidate: '00000000-0000-0000-0000-000000000004',
};

export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json();

    if (!role || !['founding', 'select', 'client', 'candidate'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient();
    const userId = DEMO_USERS[role as keyof typeof DEMO_USERS];

    // First, ensure the demo user exists in the users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingUser) {
      // Create the demo user
      const { error: createError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: `demo-${role}@refer-ify.com`,
          role: role,
          full_name: getDemoName(role),
          created_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (createError) {
        console.error('Error creating demo user:', createError);
      }
    }

    // Set the demo cookie
    const cookieStore = await cookies();
    cookieStore.set('dev_role_override', role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    // Also set a cookie with the user ID for pages that need it
    cookieStore.set('demo_user_id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      role,
      userId,
      redirect: getRoleRedirect(role),
    });
  } catch (error: any) {
    console.error('Demo auth error:', error);
    return NextResponse.json(
      { error: 'Failed to set demo role', details: error.message },
      { status: 500 }
    );
  }
}

function getDemoName(role: string): string {
  const names = {
    founding: 'Sarah Chen (Demo)',
    select: 'Michael Rodriguez (Demo)',
    client: 'Tech Corp Inc (Demo)',
    candidate: 'Alex Johnson (Demo)',
  };
  return names[role as keyof typeof names] || 'Demo User';
}

function getRoleRedirect(role: string): string {
  const redirects = {
    founding: '/founding',
    select: '/select-circle',
    client: '/client',
    candidate: '/candidate',
  };
  return redirects[role as keyof typeof redirects] || '/';
}