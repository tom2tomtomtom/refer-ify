'use client';

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, CheckCircle, AlertCircle } from "lucide-react";

interface AIMatchScoreProps {
  matchScore: {
    overall_score: number;
    skills_match: number;
    experience_match: number;
    education_match: number;
    reasoning: string;
    key_strengths: string[];
    potential_concerns: string[];
  };
  candidateName?: string;
  className?: string;
}

export function AIMatchScore({ matchScore, candidateName, className = "" }: AIMatchScoreProps) {
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

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="flex flex-row items-center gap-2">
        <Brain className="h-5 w-5 text-blue-600" />
        <CardTitle className="text-lg">
          AI Match Analysis {candidateName && `- ${candidateName}`}
        </CardTitle>
        <Badge 
          variant={getScoreBadgeVariant(matchScore.overall_score)}
          className="ml-auto"
        >
          {matchScore.overall_score}% Match
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Match</span>
            <span className={`text-sm font-bold ${getScoreColor(matchScore.overall_score)}`}>
              {matchScore.overall_score}%
            </span>
          </div>
          <Progress value={matchScore.overall_score} className="h-2" />
        </div>

        {/* Detailed Scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Skills</span>
              <span className={`text-sm font-medium ${getScoreColor(matchScore.skills_match)}`}>
                {matchScore.skills_match}%
              </span>
            </div>
            <Progress value={matchScore.skills_match} className="h-1.5" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Experience</span>
              <span className={`text-sm font-medium ${getScoreColor(matchScore.experience_match)}`}>
                {matchScore.experience_match}%
              </span>
            </div>
            <Progress value={matchScore.experience_match} className="h-1.5" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Education</span>
              <span className={`text-sm font-medium ${getScoreColor(matchScore.education_match)}`}>
                {matchScore.education_match}%
              </span>
            </div>
            <Progress value={matchScore.education_match} className="h-1.5" />
          </div>
        </div>

        {/* Key Strengths */}
        {matchScore.key_strengths && matchScore.key_strengths.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Key Strengths</span>
            </div>
            <div className="space-y-1">
              {matchScore.key_strengths.map((strength, index) => (
                <div key={index} className="text-sm text-gray-600 ml-6">
                  • {strength}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Potential Concerns */}
        {matchScore.potential_concerns && matchScore.potential_concerns.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Potential Concerns</span>
            </div>
            <div className="space-y-1">
              {matchScore.potential_concerns.map((concern, index) => (
                <div key={index} className="text-sm text-gray-600 ml-6">
                  • {concern}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Reasoning */}
        {matchScore.reasoning && (
          <div className="space-y-2">
            <span className="text-sm font-medium">AI Analysis</span>
            <p className="text-sm text-gray-600 leading-relaxed">
              {matchScore.reasoning}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}