export const dynamic = "force-dynamic";
import { requireRole } from "@/lib/auth";
import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ClientDashboardPage() {
  const { user } = await requireRole("client");
  const supabase = await getSupabaseServerComponentClient();
  
  // Get user's jobs - or use demo data
  let jobs: any[] = [];
  
  if (user.id.startsWith('demo-') || user.id.startsWith('00000000-0000-0000-0000-')) {
    // Demo data for client dashboard
    jobs = [
      {
        id: 'demo-1',
        title: 'Senior Full-Stack Engineer',
        company: 'TechCorp Inc.',
        status: 'active',
        created_at: '2024-12-01T00:00:00Z',
        salary_min: 140000,
        salary_max: 180000,
        location: 'San Francisco, CA',
        description: 'Looking for a senior full-stack engineer to join our growing team.',
        referral_count: 8
      },
      {
        id: 'demo-2', 
        title: 'VP of Engineering',
        company: 'TechCorp Inc.',
        status: 'active',
        created_at: '2024-11-28T00:00:00Z',
        salary_min: 250000,
        salary_max: 320000,
        location: 'Remote',
        description: 'Seeking an experienced VP of Engineering to lead our technical organization.',
        referral_count: 12
      },
      {
        id: 'demo-3',
        title: 'Product Designer',
        company: 'TechCorp Inc.',
        status: 'draft',
        created_at: '2024-12-02T00:00:00Z',
        salary_min: 120000,
        salary_max: 150000,
        location: 'New York, NY',
        description: 'Creative product designer to help shape our user experience.',
        referral_count: 0
      },
      {
        id: 'demo-4',
        title: 'Senior Data Scientist',
        company: 'TechCorp Inc.',
        status: 'filled',
        created_at: '2024-11-15T00:00:00Z',
        salary_min: 160000,
        salary_max: 200000,
        location: 'Austin, TX',
        description: 'Data scientist to drive insights and build ML models.',
        referral_count: 15
      }
    ];
  } else {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });
    jobs = data || [];
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Client Dashboard</h1>
        <p className="text-gray-600">Welcome back! Manage your job postings and referrals.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-2">
            <p>Active Jobs: {jobs?.filter((j: any) => j.status === 'active').length || 0}</p>
            <p>Total Jobs: {jobs?.length || 0}</p>
            <p>Draft Jobs: {jobs?.filter((j: any) => j.status === 'draft').length || 0}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/client/jobs/new">
              <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Post New Job
              </button>
            </Link>
            <Link href="/client/jobs">
              <button className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                View All Jobs
              </button>
            </Link>
            <Link href="/client/billing">
              <button className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                Manage Subscription
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="mt-8 bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Jobs</h2>
        </div>
        <div className="p-6">
          {jobs && jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.slice(0, 5).map((job: any) => (
                <div key={job.id} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <div>
                    <h3 className="font-medium">{job.title || 'Untitled Job'}</h3>
                    <p className="text-sm text-gray-600">
                      Status: {job.status} | Created: {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/client/jobs/${job.id}`}>
                    <button className="text-blue-600 hover:text-blue-800">View</button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No jobs posted yet</p>
              <Link href="/client/jobs/new">
                <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                  Post Your First Job
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}