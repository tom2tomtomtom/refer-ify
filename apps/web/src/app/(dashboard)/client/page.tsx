export const dynamic = "force-dynamic";
import { requireRole } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ClientDashboardPage() {
  const { user } = await requireRole("client");
  const supabase = await getSupabaseServerClient();
  
  // Get user's jobs
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

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
            <p>Active Jobs: {jobs?.filter(j => j.status === 'active').length || 0}</p>
            <p>Total Jobs: {jobs?.length || 0}</p>
            <p>Draft Jobs: {jobs?.filter(j => j.status === 'draft').length || 0}</p>
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
            <button className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
              Manage Subscription
            </button>
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
              {jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <div>
                    <h3 className="font-medium">{job.title || 'Untitled Job'}</h3>
                    <p className="text-sm text-gray-600">
                      Status: {job.status} | Created: {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">View</button>
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