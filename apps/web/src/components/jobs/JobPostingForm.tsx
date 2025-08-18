"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, X, DollarSign, MapPin, Clock, Users, Star } from "lucide-react";
import { toast } from "sonner";

interface JobRequirement {
  id: string;
  text: string;
  required: boolean;
}

interface JobFormData {
  title: string;
  description: string;
  requirements: JobRequirement[];
  location_type: "remote" | "hybrid" | "onsite";
  location_city: string;
  salary_min: number;
  salary_max: number;
  currency: string;
  skills: string[];
  experience_level: "junior" | "mid" | "senior" | "executive";
  job_type: "full_time" | "contract" | "part_time";
  subscription_tier: "connect" | "priority" | "exclusive";
}

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"];
const SKILLS_SUGGESTIONS = [
  "React", "Node.js", "TypeScript", "Python", "AWS", "Docker", "Kubernetes",
  "Product Management", "Sales", "Marketing", "Design", "Data Science", "DevOps"
];

const TIER_FEATURES = {
  connect: {
    price: "$500",
    features: ["Basic job posting", "Standard visibility", "Email notifications"],
    color: "bg-blue-50 border-blue-200"
  },
  priority: {
    price: "$1,500", 
    features: ["Featured listing", "Advanced filters", "Priority support", "Enhanced analytics"],
    color: "bg-purple-50 border-purple-200"
  },
  exclusive: {
    price: "$3,000",
    features: ["Premium placement", "Dedicated support", "Custom branding", "Full analytics", "Priority matching"],
    color: "bg-orange-50 border-orange-200"
  }
};

export function JobPostingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    requirements: [{ id: "1", text: "", required: true }],
    location_type: "remote",
    location_city: "",
    salary_min: 0,
    salary_max: 0,
    currency: "USD",
    skills: [],
    experience_level: "mid",
    job_type: "full_time",
    subscription_tier: "connect"
  });

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, { id: Date.now().toString(), text: "", required: false }]
    }));
  };

  const removeRequirement = (id: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req.id !== id)
    }));
  };

  const updateRequirement = (id: string, text: string, required?: boolean) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map(req => 
        req.id === id ? { ...req, text, ...(required !== undefined && { required }) } : req
      )
    }));
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    setLoading(true);
    try {
      // For drafts, save without payment
      if (isDraft) {
        const payload = {
          ...formData,
          status: "draft",
          requirements: formData.requirements.filter(req => req.text.trim())
        };

        const response = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Failed to save draft");

        toast.success("Job saved as draft!");
        router.push("/client/jobs");
        return;
      }

      // For publishing, initiate payment flow
      await handlePaymentFlow();
    } catch {
      toast.error("Failed to create job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFlow = async () => {
    try {
      // Get user email for payment
      const userResponse = await fetch("/api/auth/user");
      const userData = await userResponse.json();
      
      if (!userData.user?.email) {
        throw new Error("User email not found");
      }

      // Create payment session
      const paymentResponse = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "job_posting",
          subscription_tier: formData.subscription_tier,
          customerEmail: userData.user.email,
          job_data: {
            title: formData.title,
            subscription_tier: formData.subscription_tier
          }
        })
      });

      if (!paymentResponse.ok) {
        throw new Error("Failed to create payment session");
      }

      const paymentData = await paymentResponse.json();
      
      // Store job data in session storage for post-payment processing
      sessionStorage.setItem('pendingJobData', JSON.stringify({
        ...formData,
        status: "active",
        requirements: formData.requirements.filter(req => req.text.trim())
      }));

      // Redirect to Stripe Checkout
      window.location.href = paymentData.url;
    } catch (error) {
      console.error("Payment flow error:", error);
      throw error;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Post a New Job</h1>
        <p className="text-muted-foreground">Create a compelling job posting to attract top talent</p>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Job Details</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Senior Software Engineer"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Experience Level</Label>
                  <Select value={formData.experience_level} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, experience_level: value as JobFormData["experience_level"] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                      <SelectItem value="mid">Mid-level (2-5 years)</SelectItem>
                      <SelectItem value="senior">Senior (5+ years)</SelectItem>
                      <SelectItem value="executive">Executive/Leadership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Job Type</Label>
                  <Select value={formData.job_type} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, job_type: value as JobFormData["job_type"] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="part_time">Part-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Compensation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Work Type</Label>
                  <Select value={formData.location_type} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, location_type: value as JobFormData["location_type"] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location_city">Location</Label>
                  <Input
                    id="location_city"
                    placeholder={formData.location_type === "remote" ? "Anywhere" : "City, Country"}
                    value={formData.location_city}
                    onChange={(e) => setFormData(prev => ({ ...prev, location_city: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Salary Range
                </Label>
                <div className="flex gap-2 items-center">
                  <Select value={formData.currency} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(curr => (
                        <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={formData.salary_min || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary_min: parseInt(e.target.value) || 0 }))}
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={formData.salary_max || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary_max: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Requirements</CardTitle>
              <CardDescription>Add specific requirements and qualifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.requirements.map((req, index) => (
                <div key={req.id} className="flex gap-2 items-start">
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      checked={req.required}
                      onCheckedChange={(checked) => updateRequirement(req.id, req.text, checked as boolean)}
                    />
                    <span className="text-sm text-muted-foreground">Required</span>
                  </div>
                  <Input
                    placeholder="e.g. 3+ years experience with React"
                    value={req.text}
                    onChange={(e) => updateRequirement(req.id, e.target.value)}
                    className="flex-1"
                  />
                  {formData.requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRequirement(req.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addRequirement}>
                <Plus className="h-4 w-4 mr-2" />
                Add Requirement
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills & Technologies</CardTitle>
              <CardDescription>Add relevant skills to help with matching</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a skill and press Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(skillInput))}
                />
                <Button type="button" onClick={() => addSkill(skillInput)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                              {SKILLS_SUGGESTIONS.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => addSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
              </div>

              {formData.skills.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Skills:</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map(skill => (
                      <Badge key={skill} variant="default" className="flex items-center gap-1">
                        {skill}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Choose Your Subscription Tier</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(TIER_FEATURES).map(([tier, info]) => (
                <Card
                  key={tier}
                  className={`cursor-pointer transition-all ${
                    formData.subscription_tier === tier 
                      ? info.color + " ring-2 ring-primary" 
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, subscription_tier: tier as JobFormData["subscription_tier"] }))}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="capitalize">{tier}</span>
                      {tier === "exclusive" && <Star className="h-5 w-5 text-orange-500" />}
                    </CardTitle>
                    <CardDescription className="text-2xl font-bold">{info.price}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {info.features.map((feature, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit(true)}
            disabled={loading || !formData.title.trim()}
          >
            <Clock className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit(false)}
            disabled={loading || !formData.title.trim() || !formData.description.trim()}
          >
            {loading ? "Publishing..." : "Publish Job"}
          </Button>
        </div>
      </div>
    </div>
  );
}
