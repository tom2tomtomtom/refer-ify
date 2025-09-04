import { requireRole } from "@/lib/auth";
import dynamicImport from 'next/dynamic';

const RealTimeJobFeed = dynamicImport(() => 
  import("@/components/jobs/RealTimeJobFeed").then(mod => ({ default: mod.RealTimeJobFeed })), 
  { 
    loading: () => <div className="space-y-4"><div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div><div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div><div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div></div>
  }
);

export const dynamic = "force-dynamic";

export default async function SelectCircleJobOpportunitiesAliasPage() {
  await requireRole("select_circle");
  return (
    <div>
      <h1 className="sr-only">Opportunity Board</h1>
      <RealTimeJobFeed userRole="select_circle" />
    </div>
  );
}



