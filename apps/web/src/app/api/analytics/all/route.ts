import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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

// Consolidated analytics + dev utilities endpoint
export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'client';
  const jobId = searchParams.get('job_id');

  try {
    if (type === 'client') {
      // Client analytics - existing functionality
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }

      const role = profile.role?.toLowerCase();
      const isClient = role?.includes("client");

      if (!isClient) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      // Get all jobs posted by this client
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select(`
          id,
          title,
          created_at,
          status,
          salary_min,
          salary_max,
          location,
          referrals (
            id,
            status,
            created_at
          )
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (jobsError) {
        console.error("Error fetching jobs:", jobsError);
        return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 });
      }

      // Calculate analytics
      const totalJobs = jobs?.length || 0;
      const activeJobs = jobs?.filter(job => job.status === "active")?.length || 0;
      
      let totalReferrals = 0;
      let hiredCandidates = 0;
      const jobMetrics = jobs?.map(job => {
        const jobReferrals = (job.referrals as any[]) || [];
        const hired = jobReferrals.filter(r => r.status === "hired").length;
        
        totalReferrals += jobReferrals.length;
        hiredCandidates += hired;
        
        return {
          id: job.id,
          title: job.title,
          totalReferrals: jobReferrals.length,
          hiredCandidates: hired,
          conversionRate: jobReferrals.length > 0 ? (hired / jobReferrals.length * 100).toFixed(1) : "0.0",
          created_at: job.created_at,
          status: job.status
        };
      }) || [];

      const conversionRate = totalReferrals > 0 ? (hiredCandidates / totalReferrals * 100).toFixed(1) : "0.0";

      return NextResponse.json({
        summary: {
          totalJobs,
          activeJobs,
          totalReferrals,
          hiredCandidates,
          conversionRate: `${conversionRate}%`
        },
        jobMetrics
      });
    }

    if (type === 'job' && jobId) {
      // Job-specific analytics
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select(`
          id,
          title,
          client_id,
          created_at,
          status,
          salary_min,
          salary_max,
          location,
          description,
          requirements,
          referrals (
            id,
            status,
            created_at,
            candidate_name,
            candidate_email,
            referrer:profiles!referrer_id (
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq("id", jobId)
        .single();

      if (jobError) {
        console.error("Error fetching job:", jobError);
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      // Check if user has access to this job
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const isClient = job.client_id === user.id;
      const isAdmin = profile?.role?.toLowerCase()?.includes("founding");

      if (!isClient && !isAdmin) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      const referrals = (job.referrals as any[]) || [];
      
      // Calculate status distribution
      const statusCounts = referrals.reduce((acc: any, referral: any) => {
        const status = referral.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Calculate timeline data (referrals by week)
      const weeklyData = referrals.reduce((acc: any, referral: any) => {
        const date = new Date(referral.created_at);
        const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
        acc[weekKey] = (acc[weekKey] || 0) + 1;
        return acc;
      }, {});

      const timeline = Object.entries(weeklyData).map(([week, count]) => ({
        week,
        count
      })).sort((a, b) => a.week.localeCompare(b.week));

      // Recent referrals with referrer info
      const recentReferrals = referrals
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .map((referral: any) => ({
          id: referral.id,
          candidate_name: referral.candidate_name,
          candidate_email: referral.candidate_email,
          status: referral.status,
          created_at: referral.created_at,
          referrer: referral.referrer ? {
            name: `${referral.referrer.first_name} ${referral.referrer.last_name}`,
            email: referral.referrer.email
          } : null
        }));

      return NextResponse.json({
        job: {
          id: job.id,
          title: job.title,
          created_at: job.created_at,
          status: job.status,
          location: job.location,
          salary_range: job.salary_min && job.salary_max 
            ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
            : null
        },
        metrics: {
          totalReferrals: referrals.length,
          statusCounts,
          hiredCount: statusCounts.hired || 0,
          conversionRate: referrals.length > 0 
            ? ((statusCounts.hired || 0) / referrals.length * 100).toFixed(1) + '%'
            : '0.0%'
        },
        timeline,
        recentReferrals
      });
    }

    // Add dev utilities
    if (type === 'dev' && process.env.NODE_ENV === 'development') {
      const devEmail = process.env.NEXT_PUBLIC_DEV_SUPERUSER_EMAIL;
      if (devEmail && user.email === devEmail) {
        return NextResponse.json({
          message: "Dev utilities available",
          endpoints: [
            { action: "switch-role", method: "POST" },
            { action: "create-test-users", method: "POST" }
          ]
        });
      }
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ error: "Invalid analytics type or missing parameters" }, { status: 400 });

  } catch (error) {
    console.error("Error in analytics endpoint:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Dev utilities only available in development' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const devEmail = process.env.NEXT_PUBLIC_DEV_SUPERUSER_EMAIL;
  if (!devEmail || user.email !== devEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    switch (action) {
      case 'switch-role': {
        const { role } = await request.json();
        if (!role) return NextResponse.json({ error: "role is required" }, { status: 400 });

        const { data, error } = await supabase
          .from("profiles")
          .update({ role } as any)
          .match({ id: user.id as string })
          .select("id, role")
          .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ profile: data });
      }

      case 'create-test-users': {
        const results = [];

        for (const testUser of TEST_USERS) {
          try {
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
              email: testUser.email,
              password: testUser.password,
              email_confirm: true,
              user_metadata: {
                first_name: testUser.first_name,
                last_name: testUser.last_name,
              }
            });

            if (authError) {
              results.push({
                email: testUser.email,
                success: false,
                error: authError.message
              });
              continue;
            }

            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: authData.user.id,
                email: testUser.email,
                role: testUser.role,
                first_name: testUser.first_name,
                last_name: testUser.last_name,
                company: testUser.company
              });

            results.push({
              email: testUser.email,
              success: !profileError,
              error: profileError?.message,
              role: testUser.role,
              id: authData.user.id
            });

          } catch (error) {
            results.push({
              email: testUser.email,
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
      }

      default:
        return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 });
    }
  } catch (error) {
    console.error("Dev utilities error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}