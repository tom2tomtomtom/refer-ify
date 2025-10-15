import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Star, Building2, Rocket } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            Transparent Pricing
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
            NEVER AGAIN PAY A<br/>PERCENTAGE OF SALARY FOR HIRING!
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
            Flat, transparent pricing that saves you 60-80% compared to traditional recruiters.
          </p>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            No hidden fees. No percentage-based commissions. Just predictable, honest pricing.
          </p>
        </div>
      </section>

      {/* Flat Fee Structure */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Flat Fees Per Successful Hire</h2>
            <p className="text-lg text-gray-600">Simple, predictable pricing based on salary range</p>
          </div>

          <div className="grid md:grid-cols-5 gap-6 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">$100-150K</CardTitle>
                <CardDescription>Salary Range</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">$15,000</div>
                <p className="text-sm text-gray-500">per hire</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">$150-200K</CardTitle>
                <CardDescription>Salary Range</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">$20,000</div>
                <p className="text-sm text-gray-500">per hire</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500 hover:border-blue-600 transition-colors relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                Most Popular
              </Badge>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">$200-300K</CardTitle>
                <CardDescription>Salary Range</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">$30,000</div>
                <p className="text-sm text-gray-500">per hire</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">$300-400K</CardTitle>
                <CardDescription>Salary Range</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">$39,000</div>
                <p className="text-sm text-gray-500">per hire</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">$400K+</CardTitle>
                <CardDescription>Salary Range</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">$45,000</div>
                <p className="text-sm text-gray-500">per hire</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">💡 Only pay when you successfully hire. No upfront retainers or hidden fees.</p>
          </div>
        </div>
      </section>

      {/* Platform Access Tiers */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Platform Access Level</h2>
            <p className="text-lg text-gray-600">Monthly platform fees for network access and tools</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Start Up / Small Business */}
            <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="w-8 h-8 text-blue-600" />
                  <Badge variant="secondary">Basic</Badge>
                </div>
                <CardTitle className="text-2xl">Start Up / Small Business</CardTitle>
                <CardDescription className="text-base mt-2">
                  Perfect for growing companies making 1-3 hires per year
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$500</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Access to Referrer network</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Unlimited job postings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Basic candidate pipeline</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Email support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Standard response time (3-5 days)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-400">Priority access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-400">Account manager</span>
                  </li>
                </ul>
                <Link href="/apply" className="block mt-6">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Mid-Sized Business */}
            <Card className="border-2 border-blue-500 hover:border-blue-600 transition-all hover:shadow-xl relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                Most Popular
              </Badge>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Rocket className="w-8 h-8 text-blue-600" />
                  <Badge>Priority</Badge>
                </div>
                <CardTitle className="text-2xl">Mid-Sized Business</CardTitle>
                <CardDescription className="text-base mt-2">
                  Ideal for established companies with regular hiring needs
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$1,500</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold">Everything in Start Up, plus:</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Access to Founder network</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Priority placement in feeds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Phone & video support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Fast response time (1-2 days)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Advanced analytics & reporting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-400">Dedicated account manager</span>
                  </li>
                </ul>
                <Link href="/apply" className="block mt-6">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Business */}
            <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Star className="w-8 h-8 text-blue-600" />
                  <Badge variant="secondary">Enterprise</Badge>
                </div>
                <CardTitle className="text-2xl">Enterprise Business</CardTitle>
                <CardDescription className="text-base mt-2">
                  White-glove service for complex executive hiring
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$3,000</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold">Everything in Mid-Sized, plus:</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Exclusive 24-hour priority access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Dedicated account manager</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Custom talent pipelines</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Same-day response time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Quarterly strategy sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">White-glove concierge service</span>
                  </li>
                </ul>
                <Link href="/contact" className="block mt-6">
                  <Button className="w-full">Contact Sales</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison to Traditional Recruiters */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Compare to Traditional Recruiters</h2>
            <p className="text-lg text-gray-600">See how much you save with flat-fee pricing</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700">Traditional Recruiter</CardTitle>
                <CardDescription className="text-red-600">$200K hire at 25% fee</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Upfront retainer</span>
                    <span className="font-semibold text-red-700">$25,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Success fee (25%)</span>
                    <span className="font-semibold text-red-700">$50,000</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="font-bold">Total Cost</span>
                    <span className="text-2xl font-bold text-red-700">$75,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-700">Refer-ify</CardTitle>
                <CardDescription className="text-green-600">$200K hire with Mid-Sized plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Platform fee (1 month)</span>
                    <span className="font-semibold text-green-700">$1,500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Flat hire fee</span>
                    <span className="font-semibold text-green-700">$20,000</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="font-bold">Total Cost</span>
                    <span className="text-2xl font-bold text-green-700">$21,500</span>
                  </div>
                  <div className="text-center pt-2">
                    <Badge className="bg-green-600">Save $53,500 (71%)</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Stop Overpaying for Hiring?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 200+ companies saving an average of $45,000 per hire
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/apply">
              <Button size="lg" variant="secondary" className="px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="px-8 text-white border-white hover:bg-white/10">
                Schedule Demo
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm opacity-75">
            No credit card required • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </section>
    </div>
  );
}
