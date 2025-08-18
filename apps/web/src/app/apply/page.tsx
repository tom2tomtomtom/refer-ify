import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ApplyPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Request Invitation</h1>
        <p className="mt-2 text-muted-foreground">We’re currently accepting applications from senior executives and trusted referrers.</p>
        <div className="mt-6 rounded border bg-white p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Please sign in to continue your application.</p>
          <div className="mt-4">
            <Link href="/login" className="inline-flex rounded bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90">Sign in to Apply</Link>
          </div>
        </div>
      </section>
    </main>
  );
}


