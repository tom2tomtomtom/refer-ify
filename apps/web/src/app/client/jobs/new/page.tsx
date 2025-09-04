import { requireRole } from "@/lib/auth";
import { JobPostingForm } from "@/components/jobs/JobPostingForm";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  await requireRole("client");
  
  return <JobPostingForm />;
}
