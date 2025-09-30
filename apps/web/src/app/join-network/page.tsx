import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Users, DollarSign, Network, Star, Award, Shield, TrendingUp } from "lucide-react";

export default function JoinNetworkPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            Elite Professional Network
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-900 to-purple-600 bg-clip-text text-transparent">
            Turn Your Network Into Income.<br />
            Join Refer-ify's Elite Circle.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Earn meaningful fees by connecting exceptional talent with top companies. 
            Join 2,000+ industry leaders monetizing their professional relationships.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="#application">
              <Button size="lg" className="px-8">
                Apply to Join
              </Button>
            </Link>
            <Link href="#learn-more">
              <Button variant="outline" size="lg" className="px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 px-4 bg-white" id="learn-more">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Top Professionals Join Refer-ify</h2>
            <p className="text-lg text-gray-600">Transform your network from a nice-to-have into a significant revenue stream</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-lg">Significant Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Earn 40-45% of placement fees. Average successful referral: $15,000-$25,000</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Network className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Quality Network</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Connect with vetted companies posting exclusive, high-value executive roles</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Reputation Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Only refer candidates you know personally. Maintain your professional reputation</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Career Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Expand your influence and build deeper relationships across industries</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Two Tier System */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Two Membership Tiers</h2>
            <p className="text-lg text-gray-600">Choose the level that matches your network and commitment</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center py-3">
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">Select Circle</span>
                </div>
              </div>
              <CardHeader className="pt-16">
                <CardTitle className="text-2xl text-center">Premium Referrers</CardTitle>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">40%</div>
                  <div className="text-gray-600">of placement fees</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Access to All Opportunities</div>
                    <div className="text-sm text-gray-600">See all available roles across our network</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Personal Referral Focus</div>
                    <div className="text-sm text-gray-600">Refer people you know personally and professionally</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Earnings Dashboard</div>
                    <div className="text-sm text-gray-600">Track referrals, interviews, and payments</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Professional Development</div>
                    <div className="text-sm text-gray-600">Access to networking events and industry insights</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-amber-200">
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-3">
                <div className="flex items-center justify-center gap-2">
                  <Star className="w-5 h-5" />
                  <span className="font-semibold">Founding Circle</span>
                  <Badge variant="secondary" className="ml-2 text-xs">Invitation Only</Badge>
                </div>
              </div>
              <CardHeader className="pt-16">
                <CardTitle className="text-2xl text-center">Network Leaders</CardTitle>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">15%</div>
                  <div className="text-gray-600">of all network revenue</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Full Platform Access</div>
                    <div className="text-sm text-gray-600">Manage your own network of 40+ Select Circle members</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Revenue Sharing</div>
                    <div className="text-sm text-gray-600">Earn from all placements made by your network</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Strategic Advisory</div>
                    <div className="text-sm text-gray-600">Help shape platform direction and new features</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Exclusive Events</div>
                    <div className="text-sm text-gray-600">Private dinners and exclusive industry gatherings</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
            <p className="text-lg text-gray-600">See how our members are building meaningful income streams</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    JM
                  </div>
                  <div>
                    <div className="font-semibold">Jennifer M.</div>
                    <div className="text-sm text-gray-600">Former VP Engineering, Meta</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <blockquote className="text-gray-700 italic mb-4">
                  "In my first year, I earned $87,000 from 4 successful referrals. It's rewarding to help friends find amazing opportunities while building meaningful income."
                </blockquote>
                <div className="text-sm text-blue-600 font-medium">Select Circle Member</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-white font-semibold">
                    RS
                  </div>
                  <div>
                    <div className="font-semibold">Robert S.</div>
                    <div className="text-sm text-gray-600">Former CTO, Stripe</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <blockquote className="text-gray-700 italic mb-4">
                  "Leading a network of 45 professionals, I've generated $340,000 in revenue sharing over 18 months. The relationships I've built are invaluable."
                </blockquote>
                <div className="text-sm text-amber-600 font-medium">Founding Circle Leader</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    AL
                  </div>
                  <div>
                    <div className="font-semibold">Anna L.</div>
                    <div className="text-sm text-gray-600">Former Head of Product, Airbnb</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <blockquote className="text-gray-700 italic mb-4">
                  "The quality of opportunities is exceptional. I only refer people I genuinely believe in, and companies appreciate that level of curation."
                </blockquote>
                <div className="text-sm text-blue-600 font-medium">Select Circle Member</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 px-4" id="application">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Apply to Join</h2>
            <p className="text-lg text-gray-600">Tell us about yourself and your network. We'll review your application within 48 hours.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Network Membership Application</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <Input placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <Input placeholder="Smith" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input type="email" placeholder="john@company.com" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">LinkedIn Profile</label>
                  <Input placeholder="https://linkedin.com/in/yourprofile" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Current/Most Recent Role</label>
                  <Input placeholder="VP Engineering at TechCorp" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Industry Experience</label>
                  <Input placeholder="Technology, Finance, Healthcare, etc." />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Network Description</label>
                  <Textarea 
                    placeholder="Tell us about your professional network. What industries, roles, and seniority levels do you have connections in?"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Why Join Refer-ify?</label>
                  <Textarea 
                    placeholder="What interests you about joining our network? How do you see yourself contributing?"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Membership Tier</label>
                  <select className="w-full border rounded-md p-2">
                    <option value="">Select a tier</option>
                    <option value="select">Select Circle (40% fees from referrals)</option>
                    <option value="founding">Founding Circle (15% revenue share - invitation only)</option>
                    <option value="either">Either tier - let you decide</option>
                  </select>
                </div>

                <Button className="w-full" size="lg">
                  Submit Application
                </Button>

                <p className="text-sm text-gray-500 text-center">
                  Applications are reviewed within 48 hours. You'll receive an email with next steps.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="font-semibold mb-2">How much can I earn?</h3>
              <p className="text-gray-600">Select Circle members earn 40% of placement fees (typically $15,000-$25,000 per successful hire). Founding Circle members earn 15% of all revenue generated by their network, which can scale significantly.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What's the time commitment?</h3>
              <p className="text-gray-600">It's flexible. Most members spend 2-5 hours per month reviewing opportunities and making referrals. The key is quality over quantity - refer people you genuinely know and believe in.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">How are payments handled?</h3>
              <p className="text-gray-600">Payments are processed monthly via ACH transfer after successful placements. We handle all invoicing and client payment collection - you just focus on making great connections.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What if a referral doesn't work out?</h3>
              <p className="text-gray-600">There's no risk to you. Fees are only paid after successful placements and completion of probationary periods. Your reputation is protected because you only refer people you know personally.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">How do you ensure quality?</h3>
              <p className="text-gray-600">We carefully vet all network members and maintain strict quality standards. Only refer people you've worked with directly or know professionally. This maintains trust and reputation for everyone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Monetize Your Network?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join 2,000+ professionals earning meaningful income by connecting exceptional talent with great opportunities.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="#application">
              <Button size="lg" variant="secondary" className="px-8">
                Apply Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="px-8 text-white border-white hover:bg-white hover:text-blue-600">
                Questions? Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export const dynamic = "force-dynamic";