import Link from "next/link";

export const dynamic = "force-dynamic";

const PLANS = [
  {
    name: "CONNECT",
    price: "$500/mo",
    highlight: false,
    features: [
      "Standard visibility",
      "Relationship-based referrals",
      "Access to Connect opportunities"
    ],
    fee: "Placement fee applies",
    perfect: "Scaling teams with predictable hiring",
  },
  {
    name: "PRIORITY",
    price: "$1,500/mo",
    highlight: true,
    features: [
      "Featured listings",
      "Faster intros and priority reviews",
      "Access to Priority opportunities"
    ],
    fee: "Reduced placement fee",
    perfect: "Time-sensitive leadership hires",
  },
  {
    name: "EXCLUSIVE",
    price: "$3,000/mo",
    highlight: false,
    features: [
      "Premium placement & dedicated support",
      "Highest signal intros",
      "Full analytics"
    ],
    fee: "Best placement fee terms",
    perfect: "Confidential or critical exec roles",
  }
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      <section className="max-w-6xl mx-auto px-6 py-16 space-y-10">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight">Choose Your Access Level</h1>
          <p className="text-muted-foreground">Relationship-first executive hiring with clear pricing.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.name} className={`rounded border bg-white p-6 shadow-sm ${p.highlight ? 'ring-2 ring-black' : ''}`}>
              <div className="text-xs tracking-widest text-muted-foreground">PLAN</div>
              <div className="flex items-center justify-between">
                <div className="text-xl font-semibold">{p.name}</div>
                <div className="text-xl font-semibold">{p.price}</div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {p.features.map(f => (<li key={f}>• {f}</li>))}
              </ul>
              <div className="mt-4 text-sm">{p.fee}</div>
              <div className="mt-1 text-xs text-muted-foreground">Perfect for: {p.perfect}</div>
              <Link href="/apply" className="mt-6 inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-white hover:opacity-90">Get Started</Link>
            </div>
          ))}
        </div>

        <section id="pricing" className="space-y-4">
          <h2 className="text-xl font-semibold">ROI Calculator</h2>
          <p className="text-sm text-muted-foreground">Example: filling a Director role with a $180K placement fee vs traditional executive search can save 60-80% when leveraging our network model.</p>
        </section>
      </section>
    </main>
  );
}


