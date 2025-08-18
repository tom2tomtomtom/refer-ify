// Lightweight placeholder types. Replace with generated types from Supabase if needed.
export type UserRole = "founding_circle" | "select_circle" | "client" | "candidate";
export type JobStatus = "draft" | "active" | "paused" | "filled";
export type SubscriptionTier = "connect" | "priority" | "exclusive";
export type ReferralStatus = "submitted" | "reviewed" | "shortlisted" | "hired" | "rejected";

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole | null;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          company: string | null;
          linkedin_url: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      jobs: {
        Row: {
          id: string;
          client_id: string;
          title: string | null;
          description: string | null;
          requirements: Record<string, unknown> | null;
          salary_min: number | null;
          salary_max: number | null;
          currency: string | null;
          status: JobStatus | null;
          subscription_tier: SubscriptionTier | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["jobs"]["Row"]> & { id?: string; client_id: string };
        Update: Partial<Database["public"]["Tables"]["jobs"]["Row"]>;
      };
      referrals: {
        Row: {
          id: string;
          job_id: string;
          referrer_id: string;
          candidate_email: string | null;
          candidate_resume_url: string | null;
          status: ReferralStatus | null;
          ai_match_score: number | null;
          consent_given: boolean | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["referrals"]["Row"]> & { job_id: string; referrer_id: string };
        Update: Partial<Database["public"]["Tables"]["referrals"]["Row"]>;
      };
      subscriptions: {
        Row: {
          id: string;
          client_id: string;
          tier: SubscriptionTier | null;
          stripe_subscription_id: string | null;
          status: "active" | "cancelled" | "past_due" | null;
          current_period_start: string | null;
          current_period_end: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]> & { client_id: string };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      job_status: JobStatus;
      subscription_tier: SubscriptionTier;
      referral_status: ReferralStatus;
    };
  };
}


