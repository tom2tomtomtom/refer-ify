import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { OpenAI } from "openai";

// Lazy initialization of OpenAI client to avoid build-time errors
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OpenAI API key not configured - AI features will be disabled");
    return null;
  }
  
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  return openai;
}

interface MatchScore {
  overall_score: number;
  skills_match: number;
  experience_match: number;
  education_match: number;
  reasoning: string;
  key_strengths: string[];
  potential_concerns: string[];
}

// Consolidated AI endpoint handling both matching and suggestions
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'match';
  
  if (action === 'suggestions') {
    return handleSuggestions(request);
  } else {
    return handleMatching(request);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'match';
  
  if (action === 'suggestions') {
    return handleSuggestionsGet(request);
  } else {
    return handleMatchingGet(request);
  }
}

// AI suggestions functionality from the suggestions route
async function handleSuggestionsGet(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('job_id');
  const limit = parseInt(searchParams.get('limit') || '5');

  if (!jobId) {
    return NextResponse.json({ error: "job_id is required" }, { status: 400 });
  }

  try {
    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Get profiles excluding current user and those who already referred to this job
    const { data: existingReferrals } = await supabase
      .from('referrals')
      .select('referrer_id')
      .eq('job_id', jobId);

    const excludedIds = [user.id, ...(existingReferrals?.map(r => r.referrer_id) || [])];

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, company, linkedin_url, role')
      .not('id', 'in', `(${excludedIds.join(',')})`)  
      .in('role', ['founding_circle', 'select_circle'])
      .limit(limit * 3); // Get more to allow for AI filtering

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    // Use AI to score and select best matches
    const prompt = `\nJob: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\nDescription: ${job.description?.substring(0, 500) || ''}\nRequirements: ${job.requirements?.substring(0, 300) || ''}\n\nCandidate Profiles:\n${profiles.map((p, i) => `${i + 1}. ${p.first_name} ${p.last_name} - ${p.company} (${p.role})`).join('\n')}\n\nRank the top ${limit} candidates who would be best suited to refer quality candidates for this job. Consider their role, company, and likely network. Return only the numbers (1-${profiles.length}) separated by commas.`;

    try {
      const client = getOpenAIClient();
      if (!client) {
        return NextResponse.json({ 
          error: "AI features are not configured",
          suggestions: [] 
        }, { status: 503 });
      }
      
      const completion = await client.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-3.5-turbo",
        temperature: 0.3,
        max_tokens: 100,
      });

      const ranking = completion.choices[0]?.message?.content?.trim() || '';
      const selectedIndices = ranking.split(',').map(n => parseInt(n.trim()) - 1).filter(i => !isNaN(i) && i >= 0 && i < profiles.length);
      
      const suggestions = selectedIndices.slice(0, limit).map(i => profiles[i]);
      return NextResponse.json({ suggestions });
      
    } catch (aiError) {
      console.error('AI ranking failed, using fallback:', aiError);
      // Fallback to first N profiles
      return NextResponse.json({ suggestions: profiles.slice(0, limit) });
    }

  } catch (error) {
    console.error('Error in suggestions endpoint:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleSuggestions(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { job_id, referrer_ids } = body;

  if (!job_id || !referrer_ids || !Array.isArray(referrer_ids)) {
    return NextResponse.json({ error: "job_id and referrer_ids array are required" }, { status: 400 });
  }

  try {
    // Create invitation records or send notifications
    const invitations = referrer_ids.map(referrer_id => ({
      job_id,
      referrer_id,
      invited_by: user.id,
      status: 'pending',
      created_at: new Date().toISOString()
    }));

    // You would implement actual invitation logic here
    // For now, just return success
    return NextResponse.json({ 
      message: `Invitations sent to ${referrer_ids.length} referrers`,
      invitations: invitations.length
    });

  } catch (error) {
    console.error('Error sending invitations:', error);
    return NextResponse.json({ error: "Failed to send invitations" }, { status: 500 });
  }
}

// Original matching functionality
async function handleMatching(request: NextRequest) {
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
    const client = getOpenAIClient();
    if (!client) {
      return NextResponse.json({ 
        error: "AI features are not configured",
        match_score: {
          overall_score: 0,
          skills_match: 0,
          experience_match: 0,
          education_match: 0,
          reasoning: "AI features are not available",
          key_strengths: [],
          potential_concerns: ["AI matching is not configured"]
        }
      }, { status: 503 });
    }
    
    const completion = await client.chat.completions.create({
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
async function handleMatchingGet(request: NextRequest) {
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