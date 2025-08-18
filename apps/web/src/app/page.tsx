import { getSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { SolutionsSidebar } from "@/components/home/SolutionsSidebar";

export default async function Home() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="uppercase tracking-widest text-xs text-muted-foreground">Executive Recruitment Network</p>
            <h1 className="text-5xl font-extrabold tracking-tight">Network. Refer. Earn.</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">Refer-ify connects senior executives with premium opportunities across APAC & EMEA. Our private network rewards trusted introductions and accelerates executive hiring.</p>
            <div className="flex gap-3">
              <Link href="/login" className="inline-flex items-center rounded-md bg-black px-5 py-3 text-white hover:opacity-90 transition">Request Invitation</Link>
              <Link href="/client" className="inline-flex items-center rounded-md border px-5 py-3 hover:bg-white/60 transition">Explore Client Solutions</Link>
            </div>
          </div>

          <div className="mt-10">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Trusted by leaders at</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 opacity-80">
              <div className="h-10 bg-white rounded shadow-sm flex items-center justify-center text-xs font-medium">Meta</div>
              <div className="h-10 bg-white rounded shadow-sm flex items-center justify-center text-xs font-medium">Stripe</div>
              <div className="h-10 bg-white rounded shadow-sm flex items-center justify-center text-xs font-medium">Atlassian</div>
              <div className="h-10 bg-white rounded shadow-sm flex items-center justify-center text-xs font-medium">Canva</div>
            </div>
          </div>

          <div className="mt-12">
            <p className="text-sm text-muted-foreground max-w-3xl">
              Our platform blends the discretion of executive search with the velocity of trusted networks.
              Members refer exceptional professionals, clients post critical leadership requirements, and everyone wins through speed, trust, and aligned incentives.
            </p>
          </div>
        </div>

        <div className="lg:sticky lg:top-20">
          <div className="text-sm font-semibold mb-3">Our Solutions</div>
          <SolutionsSidebar />
        </div>
      </section>
    </main>
  );
}

export const dynamic = "force-dynamic";