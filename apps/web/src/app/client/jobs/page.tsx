import { requireRole } from "@/lib/auth";
import { JobListingPage } from "@/components/jobs/JobListingPage";

export const dynamic = "force-dynamic";

export default async function ClientJobsPage() {
  await requireRole("client");
  
  return <JobListingPage />;
}
