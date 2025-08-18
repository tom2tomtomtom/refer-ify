import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from("jobs")
      .select(`
        *,
        referrals(
          id,
          candidate_email,
          status,
          ai_match_score,
          created_at,
          referrer:referrer_id(
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq("id", id)
      .eq("client_id", user.id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    return NextResponse.json({ job: data });
  } catch (error: unknown) {
    console.error("Error fetching job:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
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
      status
    } = body;

    // Validation
    if (title !== undefined && !title?.trim()) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }
    if (description !== undefined && !description?.trim()) {
      return NextResponse.json({ error: "Description cannot be empty" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (requirements !== undefined) updateData.requirements = requirements;
    if (location_type !== undefined) updateData.location_type = location_type;
    if (location_city !== undefined) updateData.location_city = location_city;
    if (salary_min !== undefined) updateData.salary_min = salary_min || null;
    if (salary_max !== undefined) updateData.salary_max = salary_max || null;
    if (currency !== undefined) updateData.currency = currency;
    if (skills !== undefined) updateData.skills = skills;
    if (experience_level !== undefined) updateData.experience_level = experience_level;
    if (job_type !== undefined) updateData.job_type = job_type;
    if (subscription_tier !== undefined) updateData.subscription_tier = subscription_tier;
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabase
      .from("jobs")
      .update(updateData)
      .eq("id", id)
      .eq("client_id", user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    return NextResponse.json({ job: data });
  } catch (error: unknown) {
    console.error("Error updating job:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { error } = await supabase
      .from("jobs")
      .update({ status: "archived" })
      .eq("id", id)
      .eq("client_id", user.id);

    if (error) throw error;

    return NextResponse.json({ message: "Job archived successfully" });
  } catch (error: unknown) {
    console.error("Error archiving job:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
