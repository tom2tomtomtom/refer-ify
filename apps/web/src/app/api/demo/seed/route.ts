import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/service';

// Demo seed data endpoint - creates realistic demo data for CEO walkthrough
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServiceClient();

    // Create demo users for each role
    const demoUsers = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'demo-founding@refer-ify.com',
        role: 'founding',
        full_name: 'Sarah Chen',
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'demo-select@refer-ify.com',
        role: 'select',
        full_name: 'Michael Rodriguez',
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        email: 'demo-client@refer-ify.com',
        role: 'client',
        full_name: 'Tech Corp Inc',
      },
      {
        id: '00000000-0000-0000-0000-000000000004',
        email: 'demo-candidate@refer-ify.com',
        role: 'candidate',
        full_name: 'Alex Johnson',
      },
    ];

    // Create demo candidates
    const demoCandidates = [
      {
        id: '10000000-0000-0000-0000-000000000001',
        user_id: '00000000-0000-0000-0000-000000000004',
        full_name: 'Alex Johnson',
        email: 'alex.johnson@example.com',
        phone: '+1-555-0101',
        location: 'San Francisco, CA',
        years_experience: 8,
        current_title: 'Senior Software Engineer',
        current_company: 'Tech Startup Inc',
        skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'System Design'],
        linkedin_url: 'https://linkedin.com/in/alexjohnson',
        github_url: 'https://github.com/alexjohnson',
        portfolio_url: 'https://alexjohnson.dev',
        desired_roles: ['Staff Engineer', 'Engineering Manager', 'Tech Lead'],
        desired_locations: ['San Francisco', 'Remote', 'New York'],
        desired_salary_min: 180000,
        desired_salary_max: 250000,
        availability: 'active',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '10000000-0000-0000-0000-000000000002',
        user_id: null,
        full_name: 'Emily Carter',
        email: 'emily.carter@example.com',
        phone: '+1-555-0102',
        location: 'New York, NY',
        years_experience: 6,
        current_title: 'Product Manager',
        current_company: 'Fortune 500 Corp',
        skills: ['Product Strategy', 'Agile', 'Data Analysis', 'Stakeholder Management'],
        linkedin_url: 'https://linkedin.com/in/emilycarter',
        desired_roles: ['Senior Product Manager', 'Director of Product'],
        desired_locations: ['New York', 'Remote', 'Boston'],
        desired_salary_min: 150000,
        desired_salary_max: 200000,
        availability: 'passive',
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '10000000-0000-0000-0000-000000000003',
        user_id: null,
        full_name: 'David Kim',
        email: 'david.kim@example.com',
        phone: '+1-555-0103',
        location: 'Austin, TX',
        years_experience: 10,
        current_title: 'Engineering Manager',
        current_company: 'Tech Giant',
        skills: ['Leadership', 'Architecture', 'Python', 'Go', 'Kubernetes'],
        linkedin_url: 'https://linkedin.com/in/davidkim',
        desired_roles: ['Director of Engineering', 'VP Engineering'],
        desired_locations: ['Austin', 'Remote', 'Seattle'],
        desired_salary_min: 220000,
        desired_salary_max: 300000,
        availability: 'active',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Create demo jobs
    const demoJobs = [
      {
        id: '20000000-0000-0000-0000-000000000001',
        client_id: '00000000-0000-0000-0000-000000000003',
        title: 'Senior Full-Stack Engineer',
        company: 'Tech Corp Inc',
        location: 'San Francisco, CA',
        job_type: 'full-time',
        salary_min: 160000,
        salary_max: 220000,
        description: 'We are seeking a talented Senior Full-Stack Engineer to join our growing team...',
        requirements: ['5+ years experience', 'React/Node.js expertise', 'Strong communication skills'],
        benefits: ['Competitive salary', 'Equity', 'Health insurance', 'Remote flexibility'],
        tier: 'priority',
        status: 'active',
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '20000000-0000-0000-0000-000000000002',
        client_id: '00000000-0000-0000-0000-000000000003',
        title: 'Product Manager',
        company: 'Tech Corp Inc',
        location: 'New York, NY',
        job_type: 'full-time',
        salary_min: 140000,
        salary_max: 190000,
        description: 'Looking for an experienced Product Manager to drive our product strategy...',
        requirements: ['4+ years PM experience', 'Technical background', 'Data-driven mindset'],
        benefits: ['Competitive salary', 'Equity', 'Professional development', '401k matching'],
        tier: 'connect',
        status: 'active',
        created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Create demo referrals
    const demoReferrals = [
      {
        id: '30000000-0000-0000-0000-000000000001',
        job_id: '20000000-0000-0000-0000-000000000001',
        candidate_id: '10000000-0000-0000-0000-000000000001',
        referrer_id: '00000000-0000-0000-0000-000000000002',
        status: 'submitted',
        notes: 'Excellent candidate with strong technical skills and great cultural fit.',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '30000000-0000-0000-0000-000000000002',
        job_id: '20000000-0000-0000-0000-000000000002',
        candidate_id: '10000000-0000-0000-0000-000000000002',
        referrer_id: '00000000-0000-0000-0000-000000000002',
        status: 'reviewing',
        notes: 'Great product sense and proven track record.',
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '30000000-0000-0000-0000-000000000003',
        job_id: '20000000-0000-0000-0000-000000000001',
        candidate_id: '10000000-0000-0000-0000-000000000003',
        referrer_id: '00000000-0000-0000-0000-000000000001',
        status: 'interviewing',
        notes: 'Strong engineering leader with excellent references.',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Create demo revenue transactions
    const demoRevenue = [
      {
        id: '40000000-0000-0000-0000-000000000001',
        referral_id: '30000000-0000-0000-0000-000000000001',
        referrer_id: '00000000-0000-0000-0000-000000000002',
        amount: 15000,
        type: 'placement_fee',
        status: 'completed',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '40000000-0000-0000-0000-000000000002',
        referral_id: '30000000-0000-0000-0000-000000000002',
        referrer_id: '00000000-0000-0000-0000-000000000002',
        amount: 12000,
        type: 'placement_fee',
        status: 'pending',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '40000000-0000-0000-0000-000000000003',
        referral_id: '30000000-0000-0000-0000-000000000003',
        referrer_id: '00000000-0000-0000-0000-000000000001',
        amount: 18000,
        type: 'placement_fee',
        status: 'completed',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Insert all demo data (upsert to avoid conflicts)
    const results = await Promise.allSettled([
      // Insert candidates
      supabase.from('candidates').upsert(demoCandidates, { onConflict: 'id' }),
      // Insert jobs
      supabase.from('jobs').upsert(demoJobs, { onConflict: 'id' }),
      // Insert referrals
      supabase.from('referrals').upsert(demoReferrals, { onConflict: 'id' }),
      // Insert revenue
      supabase.from('payment_transactions').upsert(demoRevenue, { onConflict: 'id' }),
    ]);

    // Check for errors
    const errors = results
      .filter((r) => r.status === 'rejected')
      .map((r: any) => r.reason);

    if (errors.length > 0) {
      console.error('Demo seed errors:', errors);
    }

    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully',
      seeded: {
        candidates: demoCandidates.length,
        jobs: demoJobs.length,
        referrals: demoReferrals.length,
        revenue: demoRevenue.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Demo seed error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to seed demo data',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if demo data exists
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServiceClient();

    // Check if demo data exists
    const [candidates, jobs, referrals, revenue] = await Promise.all([
      supabase.from('candidates').select('id').eq('id', '10000000-0000-0000-0000-000000000001').single(),
      supabase.from('jobs').select('id').eq('id', '20000000-0000-0000-0000-000000000001').single(),
      supabase.from('referrals').select('id').eq('id', '30000000-0000-0000-0000-000000000001').single(),
      supabase.from('payment_transactions').select('id').eq('id', '40000000-0000-0000-0000-000000000001').single(),
    ]);

    const exists = {
      candidates: !!candidates.data,
      jobs: !!jobs.data,
      referrals: !!referrals.data,
      revenue: !!revenue.data,
    };

    return NextResponse.json({
      exists,
      allSeeded: Object.values(exists).every((v) => v),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to check demo data', details: error.message },
      { status: 500 }
    );
  }
}