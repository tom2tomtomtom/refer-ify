export const dynamic = "force-dynamic";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Contact Our Team</h1>
          <p className="text-muted-foreground">We’ll respond within one business day.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <form className="rounded border bg-white p-6 shadow-sm space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <input className="mt-1 w-full rounded border p-2 bg-[#f8f9fa]" placeholder="Your name" />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input className="mt-1 w-full rounded border p-2 bg-[#f8f9fa]" placeholder="you@company.com" />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <textarea className="mt-1 w-full rounded border p-2 bg-[#f8f9fa]" rows={5} placeholder="How can we help?" />
            </div>
            <button className="inline-flex items-center rounded-md bg-black px-4 py-2 text-white hover:opacity-90">Send</button>
          </form>

          <div className="rounded border bg-white p-6 shadow-sm space-y-3">
            <div className="text-xs tracking-widest text-muted-foreground">OFFICE</div>
            <div className="text-sm">Level 15, 1 Macquarie Place, Sydney NSW 2000</div>
            <div className="text-xs tracking-widest text-muted-foreground">EMAIL</div>
            <div className="text-sm">hello@refer-ify.com</div>
          </div>
        </div>
      </section>
    </main>
  );
}


