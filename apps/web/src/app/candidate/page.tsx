export const dynamic = "force-dynamic";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function CandidateDashboardPage() {
  const { user } = await requireRole("candidate");
  
  // Demo data for candidate
  const applications = user.id.startsWith('demo-') ? [
    {
      id: '1',
      job_title: 'Senior Full-Stack Engineer',
      company: 'TechCorp Inc.',
      status: 'under_review',
      applied_at: '2024-12-01',
      referrer_name: 'Jennifer M.'
    },
    {
      id: '2',
      job_title: 'VP of Engineering',
      company: 'StartupXYZ',
      status: 'interview_scheduled',
      applied_at: '2024-11-28',
      referrer_name: 'Robert S.'
    },
    {
      id: '3',
      job_title: 'Product Designer',
      company: 'DesignCo',
      status: 'rejected',
      applied_at: '2024-11-15',
      referrer_name: 'Anna L.'
    }
  ] : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'interview_scheduled': return 'bg-green-100 text-green-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Candidate Dashboard</h1>
        <p className="text-gray-600">Track your applications and opportunities</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {applications.filter(a => a.status === 'under_review').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {applications.filter(a => a.status === 'interview_scheduled').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">{app.job_title}</h3>
                    <p className="text-sm text-gray-600">{app.company}</p>
                    <p className="text-xs text-gray-500">
                      Referred by {app.referrer_name} • Applied {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(app.status)}>
                    {app.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No applications yet</p>
              <Link href="/jobs" className="text-blue-600 hover:text-blue-800">
                Browse Available Opportunities
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


