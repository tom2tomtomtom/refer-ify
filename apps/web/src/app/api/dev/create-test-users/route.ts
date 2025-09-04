import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const TEST_USERS = [
  {
    email: 'client@test.com',
    password: 'testpass123',
    role: 'client' as const,
    first_name: 'Test',
    last_name: 'Client',
    company: 'Test Corp'
  },
  {
    email: 'founding@test.com', 
    password: 'testpass123',
    role: 'founding_circle' as const,
    first_name: 'Test',
    last_name: 'Founder',
    company: 'Refer-ify'
  },
  {
    email: 'select@test.com',
    password: 'testpass123', 
    role: 'select_circle' as const,
    first_name: 'Test',
    last_name: 'Selector',
    company: 'Select Inc'
  },
  {
    email: 'candidate@test.com',
    password: 'testpass123',
    role: 'candidate' as const, 
    first_name: 'Test',
    last_name: 'Candidate',
    company: null
  }
];

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Test user creation only available in development' },
        { status: 403 }
      );
    }

    const supabase = await getSupabaseServerClient();
    const results = [];

    for (const user of TEST_USERS) {
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true, // Skip email confirmation
          user_metadata: {
            first_name: user.first_name,
            last_name: user.last_name,
          }
        });

        if (authError) {
          console.error(`Failed to create auth user for ${user.email}:`, authError);
          results.push({
            email: user.email,
            success: false,
            error: authError.message
          });
          continue;
        }

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
            company: user.company
          });

        if (profileError) {
          console.error(`Failed to create profile for ${user.email}:`, profileError);
          results.push({
            email: user.email,
            success: false, 
            error: profileError.message
          });
        } else {
          results.push({
            email: user.email,
            success: true,
            role: user.role,
            id: authData.user.id
          });
        }

      } catch (error) {
        console.error(`Error creating user ${user.email}:`, error);
        results.push({
          email: user.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: 'Test users creation completed',
      results,
      credentials: {
        note: 'Use these credentials to test different roles:',
        users: TEST_USERS.map(u => ({
          email: u.email,
          password: u.password,
          role: u.role
        }))
      }
    });

  } catch (error) {
    console.error('Error in test user creation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Test user deletion only available in development' },
        { status: 403 }
      );
    }

    const supabase = await getSupabaseServerClient();
    const results = [];

    // Get all test users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email')
      .in('email', TEST_USERS.map(u => u.email));

    if (profiles) {
      for (const profile of profiles) {
        try {
          // Delete auth user (this will cascade to profile due to FK constraint)
          const { error } = await supabase.auth.admin.deleteUser(profile.id);
          
          results.push({
            email: profile.email,
            success: !error,
            error: error?.message
          });
        } catch (error) {
          results.push({
            email: profile.email,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }

    return NextResponse.json({
      message: 'Test users cleanup completed',
      results
    });

  } catch (error) {
    console.error('Error in test user cleanup:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}