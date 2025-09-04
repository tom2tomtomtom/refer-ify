// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Brain, Users, MapPin, Briefcase, MessageSquare, Loader2 } from "lucide-react";
import { AIMatchScore } from "./AIMatchScore";

interface CandidateSuggestion {
  candidate_id: string;
  match_score: number;
  reasoning: string;
  key_match_points: string[];
  suggested_approach: string;
  candidate: {
    id: string;
    name: string;
    email: string;
    location: string;
    experience_years: number;
  };
}

interface AISuggestionsProps {
  jobId: string;
  jobTitle: string;
  onCreateReferral?: (candidateId: string, suggestion: CandidateSuggestion) => void;
}

export function AISuggestions({ jobId, jobTitle, onCreateReferral }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<CandidateSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const generateSuggestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: jobId,
          max_suggestions: 10
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  const loadExistingSuggestions = async () => {
    try {
      const response = await fetch(`/api/ai/suggestions?job_id=${jobId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.suggestions && data.suggestions.length > 0) {
          // Transform the data to match our expected format
          const formattedSuggestions = data.suggestions.map((s: any) => ({
            candidate_id: s.candidate_id,
            match_score: s.match_score,
            reasoning: s.reasoning,
            key_match_points: s.key_match_points,
            suggested_approach: s.suggested_approach,
            candidate: {
              id: s.candidate_id,
              name: `${s.profiles.first_name} ${s.profiles.last_name}`.trim(),
              email: s.profiles.email,
              location: s.profiles.location || 'Not specified',
              experience_years: s.profiles.experience_years || 0
            }
          }));
          setSuggestions(formattedSuggestions);
        }
      }
    } catch (err) {
      console.error('Failed to load existing suggestions:', err);
    }
  };

  useEffect(() => {
    loadExistingSuggestions();
  }, [jobId]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <CardTitle>AI-Powered Candidate Suggestions</CardTitle>
            </div>
            <Button 
              onClick={generateSuggestions} 
              disabled={loading}
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  {suggestions.length > 0 ? 'Refresh' : 'Generate'} Suggestions
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            AI-powered analysis of your network to find the best candidates for "{jobTitle}"
          </p>
        </CardHeader>
        
        {error && (
          <CardContent>
            <div className="text-red-600 text-sm">{error}</div>
          </CardContent>
        )}
      </Card>

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">
              Found {suggestions.length} potential candidate{suggestions.length !== 1 ? 's' : ''} in your network
            </span>
          </div>

          <div className="grid gap-4">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.candidate_id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(suggestion.candidate.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{suggestion.candidate.name}</h3>
                        <p className="text-sm text-gray-600">{suggestion.candidate.email}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {suggestion.candidate.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {suggestion.candidate.experience_years} years
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={getScoreBadgeVariant(suggestion.match_score)}
                      className="text-lg px-3 py-1"
                    >
                      {suggestion.match_score}%
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Why this is a great match:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {suggestion.key_match_points.map((point, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Suggested approach:</h4>
                      <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                        {suggestion.suggested_approach}
                      </p>
                    </div>

                    {expandedCard === suggestion.candidate_id && (
                      <div className="pt-3 border-t">
                        <h4 className="text-sm font-medium mb-2">AI Reasoning:</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {suggestion.reasoning}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => onCreateReferral?.(suggestion.candidate_id, suggestion)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Create Referral
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => 
                          setExpandedCard(
                            expandedCard === suggestion.candidate_id 
                              ? null 
                              : suggestion.candidate_id
                          )
                        }
                      >
                        {expandedCard === suggestion.candidate_id ? 'Less' : 'More'} Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!loading && suggestions.length === 0 && !error && (
        <Card>
          <CardContent className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              No AI suggestions generated yet. Click "Generate Suggestions" to analyze your network.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}