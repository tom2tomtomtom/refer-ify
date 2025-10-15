import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Linkedin, Sparkles, Heart, Target, Award } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center space-y-6 mb-12">
            {/* Large Brand Logo */}
            <div className="mb-6 flex justify-center">
              <Image
                src="https://res.cloudinary.com/dkl8kiemy/image/upload/v1760523034/ref_log_y8ozda.png"
                alt="Refer-ify - Executive Recruitment Network"
                width={280}
                height={93}
                className="h-20 w-auto sm:h-24"
                priority
              />
            </div>

            <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium bg-white/80 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 mr-1.5 inline" />
              About Refer-ify
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 bg-clip-text text-transparent">
                Recruitment Redefined
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Proving that <span className="font-semibold text-gray-900">&apos;Network = Networth&apos;</span> through ethical relationship monetization
            </p>
          </div>

          {/* Mission Statement */}
          <Card className="border-2 border-blue-100 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    We connect senior technology executives with premium opportunities across APAC & EMEA through trusted, relationship-based referrals. Our mission is to reward integrity, accelerate hiring, and build enduring professional value.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Meet the Founder Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Meet the Founder
              </span>
            </h2>
            <p className="text-gray-600 text-lg">
              Driving a new standard in recruitment with empathy, expertise, and genuine commitment
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Founder Image/Info Card */}
            <div className="lg:col-span-1">
              <Card className="border-2 border-purple-100 bg-gradient-to-br from-white to-purple-50/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  {/* Profile Image */}
                  <div className="w-40 h-40 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white">
                      <Image
                        src="https://res.cloudinary.com/dkl8kiemy/image/upload/v1760521418/sammiedobbs_uienrg.png"
                        alt="Sammie Dobbs - Founder & CEO of Refer-ify"
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                        priority
                      />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-2">Sammie Dobbs</h3>
                  <p className="text-purple-600 font-semibold mb-4">Founder & CEO</p>

                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <div className="flex items-center justify-center gap-2">
                      <Award className="w-4 h-4 text-blue-500" />
                      <span>Recruitment Expert</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Heart className="w-4 h-4 text-pink-500" />
                      <span>Belief Coding® Coach</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span>Leadership Developer</span>
                    </div>
                  </div>

                  <Link href="https://www.linkedin.com/in/sammiedobbs" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Linkedin className="w-4 h-4 mr-2" />
                      Connect on LinkedIn
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Bio Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      <strong className="text-gray-900">Sammie Dobbs</strong> is a highly experienced recruitment professional and coach, with a proven background in global talent acquisition and leadership development. She has held key recruitment roles at major international companies including <strong className="text-blue-600">Meta</strong>, <strong className="text-emerald-600">Deliveroo</strong>, and <strong className="text-yellow-600">Binance</strong>, where she specialized in building dynamic teams and empowering individuals to reach their potential.
                    </p>

                    <p className="text-gray-700 leading-relaxed mb-4">
                      Through her work, Sammie combines practical hiring expertise with powerful mindset coaching, helping both clients and candidates unlock growth, clarity, and career satisfaction. Her approach is rooted in understanding that successful recruitment goes beyond matching skills to roles—it&apos;s about aligning values, unlocking potential, and creating meaningful connections.
                    </p>

                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg my-6 border-l-4 border-purple-500">
                      <p className="text-gray-800 leading-relaxed italic">
                        &quot;Dedicated to creating purpose-driven careers and thriving workplaces, Sammie&apos;s approach blends cutting-edge recruitment with unique <strong>Belief Coding®</strong> techniques to help clients identify and neutralize limiting beliefs standing in the way of professional success.&quot;
                      </p>
                    </div>

                    <p className="text-gray-700 leading-relaxed">
                      With a strong professional network and a reputation for integrity, Sammie is passionate about making recruitment personal, impactful, and future-focused. She believes that the right opportunity can transform not just a career, but an entire life trajectory.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Call to Action */}
              <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">
                      Discover a New Standard in Recruitment
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Driven by empathy, expertise, and a genuine commitment to your success
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link href="/for-companies">
                        <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          For Companies
                        </Button>
                      </Link>
                      <Link href="/join-network">
                        <Button size="lg" variant="outline" className="border-2 hover:bg-white/60">
                          Join Our Network
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-gray-600 text-lg">
              The principles that guide every connection we make
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "Integrity",
                text: "We prioritize ethical relationships and discretion in every interaction.",
                icon: Heart,
                gradient: "from-pink-500 to-rose-500"
              },
              {
                title: "Velocity",
                text: "We reduce hiring cycles through trusted introductions and proven processes.",
                icon: Sparkles,
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                title: "Excellence",
                text: "We focus on senior roles where quality and cultural fit matter most.",
                icon: Award,
                gradient: "from-purple-500 to-indigo-500"
              },
              {
                title: "Alignment",
                text: "We reward outcomes and shared success, creating win-win partnerships.",
                icon: Target,
                gradient: "from-emerald-500 to-teal-500"
              },
            ].map((value) => {
              const Icon = value.icon;
              return (
                <Card
                  key={value.title}
                  className="border-2 border-gray-100 hover:border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 bg-gradient-to-br ${value.gradient} rounded-lg flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{value.text}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}


