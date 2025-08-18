import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const search = url.searchParams.get("search");
  const status = url.searchParams.get("status");
  const tier = url.searchParams.get("tier");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "12");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("jobs")
    .select(`
      *,
      referrals(count)
    `, { count: "exact" })
    .match({ client_id: user.id as string })
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }
  
  if (status && status !== "all") {
    query = query.eq("status", status as any);
  }
  
  if (tier && tier !== "all") {
    query = query.eq("subscription_tier", tier as any);
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json({ 
    jobs: data,
    total: count,
    page,
    limit,
    hasMore: data && data.length === limit
  });
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const {
      title,
      description,
      requirements,
      location_type,
      location_city,
      salary_min,
      salary_max,
      currency,
      skills,
      experience_level,
      job_type,
      subscription_tier,
      status = "draft"
    } = body;

    // Validation
    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const jobData = {
      client_id: user.id,
      title: title.trim(),
      description: description.trim(),
      requirements: requirements || {},
      location_type,
      location_city,
      salary_min: salary_min || null,
      salary_max: salary_max || null,
      currency: currency || "USD",
      skills: skills || [],
      experience_level: experience_level || "mid",
      job_type: job_type || "full_time",
      subscription_tier: subscription_tier || "connect",
      status
    };

    const { data, error } = await supabase
      .from("jobs")
      .insert([jobData as any])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ job: data }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating job:", error);
    const message = error instanceof Error ? error.message : "Failed to create job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


