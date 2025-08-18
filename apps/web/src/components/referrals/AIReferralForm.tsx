'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, User, FileText, Sparkles, Loader2 } from "lucide-react";
import { AIMatchScore } from "../ai/AIMatchScore";

const referralSchema = z.object({
  candidate_name: z.string().min(2, 'Name must be at least 2 characters'),
  candidate_email: z.string().email('Invalid email address'),
  candidate_resume: z.string().min(50, 'Resume must be at least 50 characters'),
  relationship: z.string().min(5, 'Please describe your relationship'),
  why_good_fit: z.string().min(20, 'Please explain why they are a good fit'),
});

type ReferralFormData = z.infer<typeof referralSchema>;

interface AIReferralFormProps {
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  onSubmit: (data: ReferralFormData & { ai_match_analysis?: any }) => void;
  initialData?: Partial<ReferralFormData>;
  className?: string;
}

export function AIReferralForm({ 
  jobId, 
  jobTitle, 
  jobDescription, 
  onSubmit, 
  initialData,
  className = "" 
}: AIReferralFormProps) {
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setValue
  } = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema),
    defaultValues: initialData,
    mode: 'onChange'
  });

  const candidateResume = watch('candidate_resume');
  const candidateEmail = watch('candidate_email');

  const analyzeMatch = async () => {
    if (!candidateResume || candidateResume.length < 50) {
      return;
    }

    setAnalyzingAI(true);
    try {
      const response = await fetch('/api/ai/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: jobId,
          candidate_resume: candidateResume,
          candidate_email: candidateEmail
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze match');
      }

      const data = await response.json();
      setAiAnalysis(data.match_analysis);
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setAnalyzingAI(false);
    }
  };

  const onFormSubmit = async (data: ReferralFormData) => {
    setSubmitLoading(true);
    try {
      await onSubmit({
        ...data,
        ai_match_analysis: aiAnalysis
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAIAssist = () => {
    if (aiAnalysis) {
      // Use AI insights to help fill the form
      const aiInsights = aiAnalysis.key_strengths?.slice(0, 3).join('. ') || '';
      const currentValue = watch('why_good_fit') || '';
      
      if (!currentValue && aiInsights) {
        setValue('why_good_fit', `Based on AI analysis: ${aiInsights}. This candidate demonstrates strong alignment with the role requirements.`);
      }
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Create AI-Enhanced Referral</CardTitle>
            {aiAnalysis && (
              <Badge variant="secondary" className="ml-auto">
                <Brain className="h-3 w-3 mr-1" />
                AI Analyzed
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Referring for: <span className="font-medium">{jobTitle}</span>
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Candidate Details</TabsTrigger>
              <TabsTrigger value="resume">Resume & Analysis</TabsTrigger>
              <TabsTrigger value="referral">Referral Info</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="candidate_name">Candidate Name</Label>
                    <Input
                      id="candidate_name"
                      {...register('candidate_name')}
                      placeholder="John Doe"
                    />
                    {errors.candidate_name && (
                      <p className="text-sm text-red-600">{errors.candidate_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="candidate_email">Candidate Email</Label>
                    <Input
                      id="candidate_email"
                      type="email"
                      {...register('candidate_email')}
                      placeholder="john@example.com"
                    />
                    {errors.candidate_email && (
                      <p className="text-sm text-red-600">{errors.candidate_email.message}</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="resume" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="candidate_resume">Candidate Resume/Profile</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={analyzeMatch}
                      disabled={analyzingAI || !candidateResume || candidateResume.length < 50}
                    >
                      {analyzingAI ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          AI Analyze Match
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="candidate_resume"
                    {...register('candidate_resume')}
                    placeholder="Paste the candidate's resume, LinkedIn profile, or detailed background information here..."
                    className="min-h-[200px]"
                  />
                  {errors.candidate_resume && (
                    <p className="text-sm text-red-600">{errors.candidate_resume.message}</p>
                  )}
                </div>

                {aiAnalysis && (
                  <AIMatchScore 
                    matchScore={{
                      overall_score: aiAnalysis.overall_score,
                      skills_match: aiAnalysis.skills_match,
                      experience_match: aiAnalysis.experience_match,
                      education_match: aiAnalysis.education_match,
                      reasoning: aiAnalysis.reasoning,
                      key_strengths: aiAnalysis.key_strengths,
                      potential_concerns: aiAnalysis.potential_concerns
                    }}
                  />
                )}
              </TabsContent>

              <TabsContent value="referral" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="relationship">Your Relationship with the Candidate</Label>
                  <Input
                    id="relationship"
                    {...register('relationship')}
                    placeholder="Former colleague, friend, university classmate, etc."
                  />
                  {errors.relationship && (
                    <p className="text-sm text-red-600">{errors.relationship.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="why_good_fit">Why are they a good fit for this role?</Label>
                    {aiAnalysis && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAIAssist}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        AI Assist
                      </Button>
                    )}
                  </div>
                  <Textarea
                    id="why_good_fit"
                    {...register('why_good_fit')}
                    placeholder="Explain why this candidate would be perfect for the role. Include specific skills, experience, and qualities..."
                    className="min-h-[120px]"
                  />
                  {errors.why_good_fit && (
                    <p className="text-sm text-red-600">{errors.why_good_fit.message}</p>
                  )}
                </div>

                {aiAnalysis && (
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">AI Insights</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      AI Match Score: <span className="font-medium">{aiAnalysis.overall_score}%</span>
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {aiAnalysis.reasoning}
                    </p>
                  </div>
                )}
              </TabsContent>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={!isValid || submitLoading}
                  className="flex-1"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating Referral...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Create Referral
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}