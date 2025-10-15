"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  HelpCircle, 
  Search, 
  MessageSquare, 
  Book, 
  Video, 
  FileText,
  Send,
  Loader2,
  ChevronRight,
  Star
} from "lucide-react";
import type { UserRole } from "@/lib/supabase/database.types";

interface HelpSection {
  id: string;
  title: string;
  icon: any;
  content: Array<{
    question: string;
    answer: string;
    category?: string;
  }>;
}

interface SupportTicket {
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
}

interface HelpContentProps {
  role: UserRole;
  onSubmitTicket?: (ticket: SupportTicket) => Promise<void>;
}

const roleSpecificHelp = {
  client: {
    title: "Client Help Center",
    description: "Everything you need to know about posting jobs and finding candidates",
    quickActions: [
      { title: "Post Your First Job", icon: FileText, href: "/client/jobs/new" },
      { title: "View Analytics", icon: Star, href: "/client/analytics" },
      { title: "Manage Billing", icon: FileText, href: "/client/billing" },
    ],
    sections: [
      {
        id: "getting-started",
        title: "Getting Started",
        icon: Book,
        content: [
          {
            question: "How do I post my first job?",
            answer: "Navigate to the Jobs section and click 'New Job'. Fill in the job details, requirements, and budget. Choose your subscription tier for maximum visibility.",
            category: "basics"
          },
          {
            question: "What subscription tier should I choose?",
            answer: "Connect ($500) for basic posting, Priority ($1500) for enhanced visibility, or Exclusive ($3000) for full network access and priority placement.",
            category: "billing"
          },
          {
            question: "How do I review candidates?",
            answer: "Go to the Candidates section to see all referrals. Each candidate has an AI match score and detailed profile to help you make decisions.",
            category: "candidates"
          }
        ]
      },
      {
        id: "advanced",
        title: "Advanced Features",
        icon: Star,
        content: [
          {
            question: "How does AI matching work?",
            answer: "Our AI analyzes candidate profiles against your job requirements, providing match scores based on skills, experience, and cultural fit.",
            category: "ai"
          },
          {
            question: "Can I track hiring metrics?",
            answer: "Yes! The Analytics dashboard shows your hiring funnel, candidate sources, time-to-hire, and ROI metrics.",
            category: "analytics"
          }
        ]
      }
    ]
  },
  founding_circle: {
    title: "Founder Help",
    description: "Guide to maximizing your network and advisory opportunities",
    quickActions: [
      { title: "View Network", icon: Star, href: "/founding/network" },
      { title: "Track Revenue", icon: FileText, href: "/founding/revenue" },
      { title: "Send Invites", icon: Send, href: "/founding/invite" },
    ],
    sections: [
      {
        id: "network-building",
        title: "Network Building",
        icon: Star,
        content: [
          {
            question: "How do I invite new members?",
            answer: "Use the Invite section to send invitations to qualified professionals. Include context about your relationship and their expertise.",
            category: "network"
          },
          {
            question: "What makes a good Referrer?",
            answer: "Look for professionals with strong networks, relevant industry experience, and a track record of successful placements or referrals.",
            category: "selection"
          }
        ]
      },
      {
        id: "revenue-sharing",
        title: "Revenue & Advisory",
        icon: FileText,
        content: [
          {
            question: "How is revenue distributed?",
            answer: "Revenue is split: 45% to platform, 40% to Referrer, 15% to Founder. You earn on all network activity.",
            category: "revenue"
          },
          {
            question: "How do I provide advisory services?",
            answer: "Clients can book advisory sessions directly. Set your rates and availability in the Advisory section.",
            category: "advisory"
          }
        ]
      }
    ]
  },
  select_circle: {
    title: "Referrer Help",
    description: "Maximize your referral success and earnings potential",
    quickActions: [
      { title: "Browse Jobs", icon: Search, href: "/select-circle/job-opportunities" },
      { title: "Track Earnings", icon: Star, href: "/select-circle/earnings" },
      { title: "Make Referral", icon: Send, href: "/select-circle/referrals" },
    ],
    sections: [
      {
        id: "referrals",
        title: "Making Referrals",
        icon: Send,
        content: [
          {
            question: "How do I make a successful referral?",
            answer: "Review job opportunities, identify candidates from your network who match the requirements, and submit detailed referrals with context.",
            category: "referrals"
          },
          {
            question: "What information should I include?",
            answer: "Provide candidate contact info, relationship context, why they're a good fit, and any relevant background information.",
            category: "best-practices"
          }
        ]
      },
      {
        id: "earnings",
        title: "Earnings & Payments",
        icon: Star,
        content: [
          {
            question: "When do I get paid?",
            answer: "Payments are processed monthly after successful placements. You earn 40% of the placement fee for your referrals.",
            category: "payments"
          },
          {
            question: "How can I increase my earnings?",
            answer: "Focus on quality referrals, build relationships with clients, and leverage AI insights to match candidates more effectively.",
            category: "optimization"
          }
        ]
      }
    ]
  },
  candidate: {
    title: "Candidate Help",
    description: "Get the most out of your job search and profile",
    quickActions: [
      { title: "Complete Profile", icon: FileText, href: "/candidate/profile" },
      { title: "Update Settings", icon: Star, href: "/candidate/settings" },
    ],
    sections: [
      {
        id: "profile",
        title: "Profile Optimization",
        icon: FileText,
        content: [
          {
            question: "How do I create a strong profile?",
            answer: "Complete all sections, upload an updated resume, highlight key achievements, and be specific about your career goals and preferences.",
            category: "profile"
          },
          {
            question: "Should I make my profile public?",
            answer: "Yes, public profiles get more visibility to our network of recruiters and referrers, leading to more opportunities.",
            category: "visibility"
          }
        ]
      },
      {
        id: "opportunities",
        title: "Job Opportunities",
        icon: Search,
        content: [
          {
            question: "How will I hear about opportunities?",
            answer: "You'll receive notifications when roles match your profile. Referrers in our network may also reach out directly.",
            category: "notifications"
          },
          {
            question: "Can I apply to jobs directly?",
            answer: "Most opportunities come through referrals, which have higher success rates than direct applications.",
            category: "process"
          }
        ]
      }
    ]
  }
};

export function HelpContent({ role, onSubmitTicket }: HelpContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [ticket, setTicket] = useState<SupportTicket>({
    subject: "",
    description: "",
    priority: "medium",
    category: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleConfig = roleSpecificHelp[role];

  const handleSubmitTicket = async () => {
    if (!ticket.subject.trim() || !ticket.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmitTicket) {
        await onSubmitTicket(ticket);
        toast.success("Support ticket submitted successfully!");
        setTicket({ subject: "", description: "", priority: "medium", category: "" });
        setShowContactForm(false);
      }
    } catch (error) {
      console.error("Failed to submit ticket:", error);
      toast.error("Failed to submit ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSections = roleConfig.sections.map(section => ({
    ...section,
    content: section.content.filter(item =>
      searchQuery === "" ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.content.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{roleConfig.title}</h1>
        <p className="text-gray-600 mt-2">{roleConfig.description}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roleConfig.quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="font-medium">{action.title}</span>
                  <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Help Sections */}
      <div className="space-y-6">
        {filteredSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-2">
                  {section.content.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center gap-2">
                          {item.question}
                          {item.category && (
                            <Badge variant="secondary" className="ml-2">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 pt-2">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contact Support
          </CardTitle>
          <CardDescription>
            Can't find what you're looking for? Get in touch with our support team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showContactForm ? (
            <Button onClick={() => setShowContactForm(true)} className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Submit Support Request
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={ticket.subject}
                  onChange={(e) => setTicket(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of your issue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={ticket.category}
                  onValueChange={(value) => setTicket(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="billing">Billing Question</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="account">Account Issue</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={ticket.priority}
                  onValueChange={(value) => setTicket(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={ticket.description}
                  onChange={(e) => setTicket(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Please provide detailed information about your issue..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmitTicket} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowContactForm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}