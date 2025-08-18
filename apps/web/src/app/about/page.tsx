export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">About Refer-ify</h1>
          <p className="text-muted-foreground">Proving that &apos;Network = Networth&apos; through ethical relationship monetization</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Mission</h2>
          <p className="leading-relaxed text-sm text-muted-foreground">
            We connect senior technology executives with premium opportunities across APAC & EMEA through trusted, relationship‑based referrals. Our mission is to reward integrity, accelerate hiring, and build enduring professional value.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Company History</h2>
          <div className="grid gap-4">
            {["01","02","03"].map((n, i) => (
              <div key={n} className="rounded border bg-white p-4 shadow-sm">
                <div className="text-xs tracking-widest text-muted-foreground">{n}</div>
                <div className="font-semibold">Milestone {i+1}</div>
                <p className="text-sm text-muted-foreground">Key achievements and growth moments shaping our network and client outcomes.</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Values</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "Integrity", text: "We prioritize ethical relationships and discretion." },
              { title: "Velocity", text: "We reduce hiring cycles through trusted introductions." },
              { title: "Excellence", text: "We focus on senior roles where quality matters most." },
              { title: "Alignment", text: "We reward outcomes and shared success." },
            ].map(v => (
              <div key={v.title} className="rounded border bg-white p-4 shadow-sm">
                <div className="text-xs tracking-widest text-muted-foreground">VALUE</div>
                <div className="font-semibold">{v.title}</div>
                <p className="text-sm text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}


