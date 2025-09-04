import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CandidateProfile {
  id: string;
  email: string;
  name: string;
  resume?: string;
  skills?: string[];
  experience_years?: number;
  location?: string;
}

interface SuggestionScore {
  candidate_id: string;
  match_score: number;
  reasoning: string;
  key_match_points: string[];
  suggested_approach: string;
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { job_id, max_suggestions = 10 } = await request.json();

    if (!job_id) {
      return NextResponse.json({ 
        error: "Job ID is required" 
      }, { status: 400 });
    }

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", job_id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ 
        error: "Job not found" 
      }, { status: 404 });
    }

    // Get potential candidates from the network
    // This could be refined to get candidates from the user's network or platform members
    const { data: candidates, error: candidatesError } = await supabase
      .from("profiles")
      .select(`
        id,
        email,
        first_name,
        last_name,
        resume_text,
        skills,
        experience_years,
        location,
        role
      `)
      .neq("role", "client") // Don't suggest other clients
      .limit(50); // Get a reasonable sample size

    if (candidatesError) {
      console.error("Failed to fetch candidates:", candidatesError);
      return NextResponse.json({ 
        error: "Failed to fetch candidate pool" 
      }, { status: 500 });
    }

    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ 
        suggestions: [],
        count: 0,
        message: "No candidates available in the network"
      });
    }

    // Create AI prompt for batch analysis
    const candidateProfiles = candidates.map((c: any) => ({
      id: c.id,
      name: `${c.first_name} ${c.last_name}`.trim(),
      email: c.email,
      resume: c.resume_text || 'No resume available',
      skills: c.skills || [],
      experience_years: c.experience_years || 0,
      location: c.location || 'Not specified'
    }));

    const prompt = `
You are an expert recruiting AI. Analyze which candidates from our network would be the best fit for this job opening.

JOB DETAILS:
Title: ${job.title}
Description: ${job.description}
Requirements: ${job.requirements || 'Not specified'}
Experience Level: ${job.experience_level || 'Not specified'}
Location: ${job.location || 'Not specified'}
Salary Range: ${job.salary_min ? `$${job.salary_min} - $${job.salary_max}` : 'Not specified'}

CANDIDATE NETWORK:
${candidateProfiles.map((c: any, i: number) => `
CANDIDATE ${i + 1}:
ID: ${c.id}
Name: ${c.name}
Email: ${c.email}
Location: ${c.location}
Experience: ${c.experience_years} years
Skills: ${Array.isArray(c.skills) ? c.skills.join(', ') : c.skills}
Resume: ${c.resume.substring(0, 500)}...
`).join('\n')}

Please analyze and rank the top ${Math.min(max_suggestions, candidates.length)} candidates for this role. 
Return a JSON array of suggestions in this format:
[
  {
    "candidate_id": "<candidate_id>",
    "match_score": <number between 0-100>,
    "reasoning": "<why this candidate is a good fit>",
    "key_match_points": ["<point 1>", "<point 2>", "<point 3>"],
    "suggested_approach": "<how to approach this candidate for referral>"
  }
]

Consider:
- Technical skills alignment
- Experience level match
- Location compatibility
- Industry experience
- Career trajectory
- Potential interest in the role
- Likelihood to respond to referral

Rank by match_score (highest first). Only include candidates with score >= 60.
`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert recruiting AI that provides candidate recommendations for job referrals. Always respond with valid JSON array."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("No response from OpenAI");
    }

    // Parse AI response
    let suggestions: SuggestionScore[];
    try {
      suggestions = JSON.parse(aiResponse);
      if (!Array.isArray(suggestions)) {
        throw new Error("Response is not an array");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json({ 
        error: "Failed to parse AI suggestions" 
      }, { status: 500 });
    }

    // Enhance suggestions with candidate details
    const enhancedSuggestions = suggestions.map(suggestion => {
      const candidate = candidateProfiles.find((c: any) => c.id === suggestion.candidate_id);
      return {
        ...suggestion,
        candidate: candidate ? {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          location: candidate.location,
          experience_years: candidate.experience_years
        } : null
      };
    }).filter(s => s.candidate !== null); // Remove suggestions where candidate wasn't found

    // Store suggestions in database for tracking
    const suggestionRecords = enhancedSuggestions.map(s => ({
      job_id,
      candidate_id: s.candidate_id,
      match_score: s.match_score,
      reasoning: s.reasoning,
      key_match_points: s.key_match_points,
      suggested_approach: s.suggested_approach,
      created_by: user.id,
      status: 'suggested'
    }));

    if (suggestionRecords.length > 0) {
      const { error: insertError } = await supabase
        .from("ai_referral_suggestions")
        .insert(suggestionRecords);

      if (insertError) {
        console.error("Failed to store suggestions:", insertError);
        // Continue anyway
      }
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        title: job.title,
        company: job.company
      },
      suggestions: enhancedSuggestions,
      count: enhancedSuggestions.length,
      analyzed_candidates: candidates.length
    });

  } catch (error) {
    console.error("AI suggestions error:", error);
    return NextResponse.json({ 
      error: "Failed to generate candidate suggestions" 
    }, { status: 500 });
  }
}

// Get existing AI suggestions for a job
export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const job_id = searchParams.get("job_id");

    if (!job_id) {
      return NextResponse.json({ 
        error: "Job ID is required" 
      }, { status: 400 });
    }

    const { data: suggestions, error } = await supabase
      .from("ai_referral_suggestions")
      .select(`
        *,
        profiles:candidate_id (
          first_name,
          last_name,
          email,
          location,
          experience_years
        )
      `)
      .eq("job_id", job_id)
      .order("match_score", { ascending: false });

    if (error) {
      console.error("Failed to fetch suggestions:", error);
      return NextResponse.json({ 
        error: "Failed to fetch suggestions" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      suggestions: suggestions || [],
      count: suggestions?.length || 0
    });

  } catch (error) {
    console.error("AI suggestions fetch error:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}