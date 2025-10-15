import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  Award,
  ArrowRight,
  CheckCircle2,
  Building2,
  UserCheck,
  Zap,
  Shield,
  Target,
  Star
} from "lucide-react";

export default async function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Hero content */}
            <div className="space-y-8">
              <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium bg-white/80 backdrop-blur-sm">
                <Zap className="w-3 h-3 mr-1.5 inline" />
                Executive Recruitment Network
              </Badge>

              <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 bg-clip-text text-transparent">
                    Network.
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Refer. Earn.
                  </span>
                </h1>

                <p className="text-xl text-gray-600 max-w-xl leading-relaxed">
                  Connect senior executives with premium opportunities across APAC & EMEA.
                  Our private network rewards trusted introductions and accelerates executive hiring.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/join-network">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
                    Request Invitation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/for-companies">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 border-2 hover:bg-white/60 backdrop-blur-sm">
                    Explore Client Solutions
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white"></div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">2,000+ Network Members</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600 font-medium ml-1">4.9/5 Rating</span>
                </div>
              </div>
            </div>

            {/* Right side - Solutions cards */}
            <div className="space-y-4">
              <div className="text-sm font-semibold text-gray-700 mb-4">Our Solutions</div>

              {/* Founders Card */}
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">01</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Founders</h3>
                        <p className="text-sm text-gray-600 mb-3">Elite Network Members</p>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            Revenue sharing & network access
                          </li>
                          <li className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            Strategic advisory opportunities
                          </li>
                        </ul>
                      </div>
                    </div>
                    <Link href="/join-network">
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Referrers Card */}
              <Card className="border-2 hover:border-purple-200 hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">02</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Referrers</h3>
                        <p className="text-sm text-gray-600 mb-3">Quality Professional Network</p>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-purple-600" />
                            Earn for successful referrals
                          </li>
                          <li className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-purple-600" />
                            Exclusive job opportunities
                          </li>
                        </ul>
                      </div>
                    </div>
                    <Link href="/apply-referrer">
                      <Button size="sm" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                        Join Network
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Client Solutions Card */}
              <Card className="border-2 hover:border-blue-200 hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">03</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Client Solutions</h3>
                        <p className="text-sm text-gray-600 mb-3">Executive Hiring Made Easy</p>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            Flat-fee pricing, no surprises
                          </li>
                          <li className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            Pre-vetted executive talent
                          </li>
                        </ul>
                      </div>
                    </div>
                    <Link href="/for-companies">
                      <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                        Explore
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                200+
              </div>
              <div className="text-sm text-gray-600 font-medium">Companies Trust Us</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                2,000+
              </div>
              <div className="text-sm text-gray-600 font-medium">Network Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                95%
              </div>
              <div className="text-sm text-gray-600 font-medium">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                3 weeks
              </div>
              <div className="text-sm text-gray-600 font-medium">Avg. Time to Hire</div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Logos */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm uppercase tracking-widest text-gray-500 font-semibold mb-8">
            Trusted by Leaders At
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 items-center">
            {['Meta', 'Stripe', 'Atlassian', 'Canva'].map((company) => (
              <div
                key={company}
                className="h-20 bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center border border-gray-100 group hover:scale-105 duration-300"
              >
                <span className="text-lg font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                  {company}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              Simple Process
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform blends executive search discretion with trusted network velocity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg mb-6">
                  1
                </div>
                <div className="p-3 rounded-xl bg-white shadow-lg mb-4">
                  <UserCheck className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Join the Network</h3>
                <p className="text-gray-600 leading-relaxed">
                  Apply as a Founder or Referrer. Get vetted and gain access to exclusive opportunities.
                </p>
              </div>
              {/* Connector line */}
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 -z-10"></div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg mb-6">
                  2
                </div>
                <div className="p-3 rounded-xl bg-white shadow-lg mb-4">
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Make Referrals</h3>
                <p className="text-gray-600 leading-relaxed">
                  Connect talented executives with companies hiring for leadership roles.
                </p>
              </div>
              {/* Connector line */}
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-200 to-pink-200 -z-10"></div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg mb-6">
                  3
                </div>
                <div className="p-3 rounded-xl bg-white shadow-lg mb-4">
                  <TrendingUp className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Earn Rewards</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get compensated when your referrals result in successful placements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              Success Stories
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              What Our Members Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="border-2 hover:shadow-xl transition-all hover:-translate-y-2 duration-300">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "Refer-ify connected me with three exceptional VP candidates in under two weeks.
                  The quality of referrals is outstanding."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Chen</div>
                    <div className="text-sm text-gray-500">CTO, TechCorp</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-2 hover:shadow-xl transition-all hover:-translate-y-2 duration-300">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "As a Founder member, I've earned over $50K in referral fees while helping
                  companies find amazing talent. Win-win!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500"></div>
                  <div>
                    <div className="font-semibold text-gray-900">Michael Rodriguez</div>
                    <div className="text-sm text-gray-500">Former VP, Stripe</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border-2 hover:shadow-xl transition-all hover:-translate-y-2 duration-300">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "The flat-fee pricing model saved us over $40K compared to traditional recruiters.
                  Highly recommended!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-orange-500"></div>
                  <div>
                    <div className="font-semibold text-gray-900">Emily Watson</div>
                    <div className="text-sm text-gray-500">Head of HR, Canva</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Refer-ify?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The trusted platform for executive recruitment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-2 hover:border-blue-200 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white w-fit mb-4">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Vetted Network</h3>
                <p className="text-gray-600">
                  All members are thoroughly vetted senior executives with proven track records.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:border-purple-200 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white w-fit mb-4">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Placement</h3>
                <p className="text-gray-600">
                  Average time-to-hire of just 3 weeks, compared to 12+ weeks with traditional firms.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:border-pink-200 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-orange-600 text-white w-fit mb-4">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Transparent Pricing</h3>
                <p className="text-gray-600">
                  Flat fees from $15K-$45K per hire. No percentage-based commissions or hidden costs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Join the Network?
          </h2>
          <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
            Connect with top talent or earn rewards for successful referrals. Get started today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/join-network">
              <Button size="lg" variant="secondary" className="text-base px-8 bg-white text-blue-600 hover:bg-blue-50 shadow-xl">
                Join as Member
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/for-companies">
              <Button size="lg" variant="outline" className="text-base px-8 border-2 border-white text-white hover:bg-white/10">
                Hire Executive Talent
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-blue-100">
            No credit card required • Apply in 5 minutes • Join 2,000+ members
          </p>
        </div>
      </section>
    </main>
  );
}

// Homepage can be statically rendered for better performance
export const dynamic = "force-static";
