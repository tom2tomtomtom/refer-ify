import { requireRole } from "@/lib/auth";
import { ClientReferralsBoard } from "@/components/referrals/ClientReferralsBoard";

export const dynamic = "force-dynamic";

export default async function ClientJobReferralsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("client");
  const { id } = await params;
  return <ClientReferralsBoard jobId={id} />;
}


