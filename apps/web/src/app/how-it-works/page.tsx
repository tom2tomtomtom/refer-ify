export const dynamic = "force-dynamic";

import { CheckCircle, Users, Briefcase, DollarSign, Shield, Zap, ArrowRight, Star, TrendingUp } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            <Shield className="w-4 h-4" />
            Invitation-Only Network
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Your Network Is Your
            <span className="text-blue-600 block">Net Worth</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform your professional relationships into substantial income. Refer-ify connects elite tech executives through warm introductions, not cold applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">$150K+ average placement fees</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">40% referrer commission</span>
            </div>
          </div>
        </div>
      </section>

      {/* Three Audiences Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How Different Roles Use Refer-ify</h2>
          <p className="text-gray-600">Choose your path based on your position in the network</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Founding Circle */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-6 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Founding Circle
            </div>
            <div className="mt-4 space-y-4">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Elite Executives</h3>
              <p className="text-gray-600 text-sm">Senior tech leaders who founded this network</p>
              
              <div className="space-y-3 pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-600 text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Invite Select Members</p>
                    <p className="text-xs text-gray-600">Curate network quality through personal invitations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-600 text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Strategic Referrals</p>
                    <p className="text-xs text-gray-600">Make high-value connections to top opportunities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-600 text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Network Growth Rewards</p>
                    <p className="text-xs text-gray-600">15% of all network placements + referral fees</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Select Circle */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-6 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Select Circle
            </div>
            <div className="mt-4 space-y-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Network Builders</h3>
              <p className="text-gray-600 text-sm">Trusted professionals making referrals</p>
              
              <div className="space-y-3 pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Browse Opportunities</p>
                    <p className="text-xs text-gray-600">See curated job requirements from elite companies</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Refer Your Network</p>
                    <p className="text-xs text-gray-600">Connect people you know to perfect opportunities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Earn Referral Fees</p>
                    <p className="text-xs text-gray-600">40% of placement fees for successful hires</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clients */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-6 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Client Companies
            </div>
            <div className="mt-4 space-y-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Hiring Companies</h3>
              <p className="text-gray-600 text-sm">Organizations seeking top talent</p>
              
              <div className="space-y-3 pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Post Requirements</p>
                    <p className="text-xs text-gray-600">Share detailed role specs with the network</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Receive Warm Introductions</p>
                    <p className="text-xs text-gray-600">Get pre-vetted candidates through trusted referrals</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Fast, Quality Hires</p>
                    <p className="text-xs text-gray-600">Skip lengthy screening with relationship-based referrals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Referral Process */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">The Referral Process</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how our relationship-based approach creates better outcomes for everyone
            </p>
          </div>

          <div className="relative">
            {/* Connection Lines */}
            <div className="hidden lg:block absolute inset-0">
              <svg className="w-full h-full" viewBox="0 0 800 400">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2"/>
                  </linearGradient>
                </defs>
                <path
                  d="M 150 100 Q 400 50 650 100"
                  stroke="url(#lineGradient)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                />
                <path
                  d="M 150 200 Q 400 150 650 200"
                  stroke="url(#lineGradient)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                />
                <path
                  d="M 150 300 Q 400 250 650 300"
                  stroke="url(#lineGradient)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                />
              </svg>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 relative z-10">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Briefcase className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Company Posts Opportunity</h3>
                  <p className="text-gray-600 text-sm">
                    Client shares detailed role requirements privately with the network. No public job boards.
                  </p>
                </div>
              </div>

              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Network Makes Referrals</h3>
                  <p className="text-gray-600 text-sm">
                    Select Circle members refer people they know personally. Warm introductions, not cold applications.
                  </p>
                </div>
              </div>

              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <DollarSign className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Everyone Wins</h3>
                  <p className="text-gray-600 text-sm">
                    Quality hire made, referrer earns commission, network grows stronger through successful placements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Differentiators */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Refer-ify Works</h2>
            <p className="text-gray-600">Built on relationships, not algorithms</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold">Invitation Only</h3>
              <p className="text-sm text-gray-600">Curated network of verified tech executives maintains quality</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold">Relationship Based</h3>
              <p className="text-sm text-gray-600">Personal referrals create stronger connections than cold outreach</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold">AI Enhanced</h3>
              <p className="text-sm text-gray-600">Smart matching helps identify the best referral opportunities</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-bold">High Value</h3>
              <p className="text-sm text-gray-600">Focus on senior roles with substantial placement fees</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing (moved near bottom, above CTA) */}
      <section id="pricing" className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20 mt-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Pricing</h2>
            <p className="text-gray-600">Subscription tiers plus performance-based placement fees</p>
          </div>

          {/* Client Pricing Tiers */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2">Connect</h3>
                <div className="text-2xl font-bold text-blue-600 mb-2">$500</div>
                <p className="text-sm text-gray-600 mb-4">+ 10-12% placement fee</p>
                <p className="text-xs text-gray-500">Small scale-ups (1-5 hires/year)</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-blue-200 ring-2 ring-blue-100">
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2">Priority</h3>
                <div className="text-2xl font-bold text-indigo-600 mb-2">$1,500</div>
                <p className="text-sm text-gray-600 mb-4">+ 8% placement fee</p>
                <p className="text-xs text-gray-500">Growing companies (5-15 hires/year)</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2">Exclusive</h3>
                <div className="text-2xl font-bold text-purple-600 mb-2">$3,000</div>
                <p className="text-sm text-gray-600 mb-4">+ 6% placement fee</p>
                <p className="text-xs text-gray-500">Large enterprises (15+ hires/year)</p>
              </div>
            </div>
          </div>

          {/* Placement Fee Example */}
          <div className="bg-white rounded-2xl p-8 shadow-xl mb-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Placement Fee Distribution</h3>
              <p className="text-gray-600">Example: $200K salary hire = $20K total placement fee (10%)</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-blue-600">$8,000</div>
                <div className="text-sm font-medium">Select Circle (40%)</div>
                <div className="text-xs text-gray-600">Referrer reward</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-amber-600">$3,000</div>
                <div className="text-sm font-medium">Founding Circle (15%)</div>
                <div className="text-xs text-gray-600">Network bonus</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-gray-600">$9,000</div>
                <div className="text-sm font-medium">Platform (45%)</div>
                <div className="text-xs text-gray-600">Operations & growth</div>
              </div>
            </div>
          </div>

          {/* Annual Earning Potential */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
              <h3 className="text-xl font-bold mb-4 text-amber-800">Founding Circle Earnings</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Placement referrals</span>
                  <span className="font-medium">$12K-40K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Subscription sharing (5%)</span>
                  <span className="font-medium">$3K-15K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Advisory services ($500/hr)</span>
                  <span className="font-medium">$10K-25K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Market intelligence</span>
                  <span className="font-medium">$6K/year</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Annual Range</span>
                    <span className="text-amber-700">$31K-86K</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-xl font-bold mb-4 text-blue-800">Select Circle Earnings</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Placement referrals</span>
                  <span className="font-medium">$6K-15K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Performance bonuses (top 20%)</span>
                  <span className="font-medium">$2K-8K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Coaching income ($400/hr)</span>
                  <span className="font-medium">$5K-20K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Data contribution</span>
                  <span className="font-medium">$6K/year</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Annual Range</span>
                    <span className="text-blue-700">$19K-49K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our multi-stream revenue model creates sustainable income opportunities. 
              The more you contribute to network success, the higher your earning potential.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section (remains last) */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Network?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join an exclusive community where professional relationships create substantial value
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/join-network">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors flex items-center gap-2">
                Apply for Select Circle
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/for-companies">
              <button className="border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-4 px-8 rounded-xl transition-colors">
                Learn About Client Access
              </button>
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Invitation-only platform • Currently accepting applications from senior tech executives
          </p>
        </div>
      </section>
    </main>
  );
}
