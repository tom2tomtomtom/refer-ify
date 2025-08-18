import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface MatchScore {
  overall_score: number;
  skills_match: number;
  experience_match: number;
  education_match: number;
  reasoning: string;
  key_strengths: string[];
  potential_concerns: string[];
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { job_id, candidate_resume, candidate_email } = await request.json();

    if (!job_id || !candidate_resume) {
      return NextResponse.json({ 
        error: "Job ID and candidate resume are required" 
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

    // Create AI matching prompt
    const prompt = `
You are an expert recruiting AI. Analyze how well this candidate matches the job requirements.

JOB DETAILS:
Title: ${job.title}
Description: ${job.description}
Requirements: ${job.requirements || 'Not specified'}
Experience Level: ${job.experience_level || 'Not specified'}
Location: ${job.location || 'Not specified'}
Salary Range: ${job.salary_min ? `$${job.salary_min} - $${job.salary_max}` : 'Not specified'}

CANDIDATE RESUME:
${candidate_resume}

Please provide a detailed analysis in the following JSON format:
{
  "overall_score": <number between 0-100>,
  "skills_match": <number between 0-100>,
  "experience_match": <number between 0-100>,
  "education_match": <number between 0-100>,
  "reasoning": "<detailed explanation of the match>",
  "key_strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "potential_concerns": ["<concern 1>", "<concern 2>"]
}

Consider:
- Technical skills alignment
- Experience level and years
- Educational background relevance
- Industry experience
- Location compatibility
- Salary expectations (if mentioned in resume)
- Cultural fit indicators
- Growth potential

Be objective and provide honest assessments. Scores should reflect realistic matching probability.
`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert recruiting AI that provides objective candidate-job match analysis. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("No response from OpenAI");
    }

    // Parse AI response
    let matchAnalysis: MatchScore;
    try {
      matchAnalysis = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json({ 
        error: "Failed to parse AI analysis" 
      }, { status: 500 });
    }

    // Store AI match analysis in database
    const { data: analysisRecord, error: analysisError } = await supabase
      .from("ai_match_analysis")
      .insert({
        job_id,
        candidate_email: candidate_email || 'unknown',
        overall_score: matchAnalysis.overall_score,
        skills_match: matchAnalysis.skills_match,
        experience_match: matchAnalysis.experience_match,
        education_match: matchAnalysis.education_match,
        reasoning: matchAnalysis.reasoning,
        key_strengths: matchAnalysis.key_strengths,
        potential_concerns: matchAnalysis.potential_concerns,
        resume_text: candidate_resume,
        created_by: user.id
      })
      .select()
      .single();

    if (analysisError) {
      console.error("Failed to store AI analysis:", analysisError);
      // Continue anyway, return the analysis even if storage fails
    }

    return NextResponse.json({
      success: true,
      match_analysis: {
        id: analysisRecord?.id,
        job_id,
        candidate_email: candidate_email || 'unknown',
        ...matchAnalysis,
        created_at: analysisRecord?.created_at || new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("AI matching error:", error);
    return NextResponse.json({ 
      error: "Failed to analyze candidate match" 
    }, { status: 500 });
  }
}

// Get AI match analyses for a job
export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const job_id = searchParams.get("job_id");
    const min_score = searchParams.get("min_score");

    if (!job_id) {
      return NextResponse.json({ 
        error: "Job ID is required" 
      }, { status: 400 });
    }

    let query = supabase
      .from("ai_match_analysis")
      .select("*")
      .eq("job_id", job_id)
      .order("overall_score", { ascending: false });

    if (min_score) {
      query = query.gte("overall_score", parseInt(min_score));
    }

    const { data: analyses, error } = await query;

    if (error) {
      console.error("Failed to fetch AI analyses:", error);
      return NextResponse.json({ 
        error: "Failed to fetch match analyses" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      analyses: analyses || [],
      count: analyses?.length || 0
    });

  } catch (error) {
    console.error("AI fetch error:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}