export default function SuccessStoriesPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight">Success Stories</h1>
          <p className="text-muted-foreground">Real outcomes from warm, relationship-based referrals.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded border bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold">VP Engineering • Series B</div>
            <p className="mt-2 text-sm text-muted-foreground">Hired via Select Circle referral in 23 days. Reduced interview load by 60%.</p>
          </article>
          <article className="rounded border bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold">Head of Product • Fintech</div>
            <p className="mt-2 text-sm text-muted-foreground">Found through a Founding Circle introduction. Offer accepted in 3 weeks.</p>
          </article>
          <article className="rounded border bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold">Country GM • APAC</div>
            <p className="mt-2 text-sm text-muted-foreground">Warm referral with prior working history. Seamless close and onboarding.</p>
          </article>
        </div>
      </section>
    </main>
  );
}


