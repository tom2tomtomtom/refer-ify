'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, Users, Briefcase, BarChart3, Target, Loader2 } from "lucide-react";
import { AISuggestions } from "@/components/ai/AISuggestions";
import { AIMatchScore } from "@/components/ai/AIMatchScore";

interface Job {
  id: string;
  title: string;
  company: string;
  status: string;
  created_at: string;
}

interface MatchAnalysis {
  id: string;
  job_id: string;
  candidate_email: string;
  overall_score: number;
  skills_match: number;
  experience_match: number;
  education_match: number;
  reasoning: string;
  key_strengths: string[];
  potential_concerns: string[];
  created_at: string;
}

interface AIInsight {
  total_analyses: number;
  average_match_score: number;
  high_quality_matches: number;
  top_skills: string[];
  recent_activity: number;
}

export default function AIInsightsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [matchAnalyses, setMatchAnalyses] = useState<MatchAnalysis[]>([]);
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysesLoading, setAnalysesLoading] = useState(false);

  useEffect(() => {
    loadJobs();
    loadInsights();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      loadMatchAnalyses(selectedJob);
    }
  }, [selectedJob]);

  const loadJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
        if (data.jobs?.length > 0 && !selectedJob) {
          setSelectedJob(data.jobs[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const loadMatchAnalyses = async (jobId: string) => {
    setAnalysesLoading(true);
    try {
      const response = await fetch(`/api/ai/match?job_id=${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setMatchAnalyses(data.analyses || []);
      }
    } catch (error) {
      console.error('Failed to load match analyses:', error);
    } finally {
      setAnalysesLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      // This would be a new API endpoint for aggregated insights
      // For now, we'll calculate basic insights from the data we have
      const response = await fetch('/api/ai/match');
      if (response.ok) {
        const data = await response.json();
        const analyses = data.analyses || [];
        
        const totalAnalyses = analyses.length;
        const averageScore = analyses.length > 0 
          ? analyses.reduce((sum: number, a: MatchAnalysis) => sum + a.overall_score, 0) / analyses.length 
          : 0;
        const highQualityMatches = analyses.filter((a: MatchAnalysis) => a.overall_score >= 80).length;
        
        setInsights({
          total_analyses: totalAnalyses,
          average_match_score: Math.round(averageScore),
          high_quality_matches: highQualityMatches,
          top_skills: ['React', 'TypeScript', 'Node.js', 'Python'], // This would come from actual data
          recent_activity: analyses.filter((a: MatchAnalysis) => {
            const createdAt = new Date(a.created_at);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return createdAt > weekAgo;
          }).length
        });
      }
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const selectedJobData = jobs.find(job => job.id === selectedJob);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            AI Insights Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            AI-powered candidate matching and referral intelligence
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total AI Analyses</p>
                  <p className="text-2xl font-bold">{insights.total_analyses}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Match Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(insights.average_match_score)}`}>
                    {insights.average_match_score}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High-Quality Matches</p>
                  <p className="text-2xl font-bold text-green-600">{insights.high_quality_matches}</p>
                  <p className="text-xs text-gray-500">80%+ match score</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                  <p className="text-2xl font-bold">{insights.recent_activity}</p>
                  <p className="text-xs text-gray-500">Last 7 days</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Job Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Select Job for AI Analysis</CardTitle>
            <Select value={selectedJob} onValueChange={setSelectedJob}>
              <SelectTrigger className="w-[300px]" size="default">
                <SelectValue placeholder="Select a job..." />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title} - {job.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      {selectedJob && selectedJobData && (
        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="suggestions">AI Candidate Suggestions</TabsTrigger>
            <TabsTrigger value="analyses">Match Analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-6">
            <AISuggestions 
              jobId={selectedJob}
              jobTitle={selectedJobData.title}
              onCreateReferral={(candidateId, suggestion) => {
                console.log('Creating referral for:', candidateId, suggestion);
                // Here you would navigate to create referral form or open a modal
              }}
            />
          </TabsContent>

          <TabsContent value="analyses" className="space-y-6">
            {analysesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading match analyses...
              </div>
            ) : matchAnalyses.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {matchAnalyses.length} AI match analysis{matchAnalyses.length !== 1 ? 'es' : ''} for "{selectedJobData.title}"
                  </span>
                </div>

                {matchAnalyses.map((analysis) => (
                  <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium">{analysis.candidate_email}</h3>
                          <p className="text-sm text-gray-600">
                            Analyzed on {new Date(analysis.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={analysis.overall_score >= 80 ? "default" : analysis.overall_score >= 60 ? "secondary" : "destructive"}
                        >
                          {analysis.overall_score}% Match
                        </Badge>
                      </div>

                      <AIMatchScore
                        matchScore={{
                          overall_score: analysis.overall_score,
                          skills_match: analysis.skills_match,
                          experience_match: analysis.experience_match,
                          education_match: analysis.education_match,
                          reasoning: analysis.reasoning,
                          key_strengths: analysis.key_strengths,
                          potential_concerns: analysis.potential_concerns
                        }}
                        candidateName={analysis.candidate_email}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    No AI match analyses found for this job yet.
                  </p>
                  <p className="text-sm text-gray-500">
                    Analyses will appear here when candidates are evaluated using AI matching.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {jobs.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              No jobs found. Create your first job posting to start using AI insights.
            </p>
            <Button asChild>
              <a href="/client/post-job">Create Job Posting</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}