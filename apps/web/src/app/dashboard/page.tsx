import Link from "next/link";

export default function DashboardIndexPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Dashboards</h1>
      <ul className="list-disc pl-6">
        <li><Link href="/client">Client</Link></li>
        <li><Link href="/candidate">Candidate</Link></li>
        <li><Link href="/founding-circle">Founding Circle</Link></li>
        <li><Link href="/select-circle">Select Circle</Link></li>
      </ul>
    </div>
  );
}


