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
      // NEW: Founding Circle Tables
      founding_metrics: {
        Row: {
          id: string;
          user_id: string;
          month: string;
          network_revenue: number | null;
          direct_referrals: number | null;
          advisory_revenue: number | null;
          active_network_members: number | null;
          successful_placements: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["founding_metrics"]["Row"]> & { user_id: string; month: string };
        Update: Partial<Database["public"]["Tables"]["founding_metrics"]["Row"]>;
      };
      advisory_sessions: {
        Row: {
          id: string;
          founder_id: string;
          client_id: string | null;
          duration_hours: number;
          status: "scheduled" | "completed" | "cancelled" | "no_show";
          session_date: string | null;
          session_type: "strategy" | "hiring" | "network" | "market_intel";
          hourly_rate: number | null;
          notes: string | null;
          outcome: string | null;
          follow_up_required: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["advisory_sessions"]["Row"]> & { founder_id: string };
        Update: Partial<Database["public"]["Tables"]["advisory_sessions"]["Row"]>;
      };
      select_circle_invitations: {
        Row: {
          id: string;
          founder_id: string;
          invited_email: string;
          invited_name: string | null;
          invited_company: string | null;
          invited_title: string | null;
          status: "sent" | "opened" | "accepted" | "declined" | "expired";
          invitation_message: string | null;
          relationship_context: string | null;
          expected_expertise: string[] | null;
          sent_at: string | null;
          opened_at: string | null;
          responded_at: string | null;
          accepted_at: string | null;
          expires_at: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["select_circle_invitations"]["Row"]> & { founder_id: string; invited_email: string };
        Update: Partial<Database["public"]["Tables"]["select_circle_invitations"]["Row"]>;
      };
      network_activity: {
        Row: {
          id: string;
          member_id: string;
          activity_type: "referral_made" | "referral_success" | "job_viewed" | "login" | "profile_updated";
          activity_data: Record<string, unknown> | null;
          points_earned: number | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["network_activity"]["Row"]> & { member_id: string; activity_type: string };
        Update: Partial<Database["public"]["Tables"]["network_activity"]["Row"]>;
      };
      revenue_distributions: {
        Row: {
          id: string;
          referral_id: string;
          founding_member_id: string | null;
          select_member_id: string | null;
          placement_fee: number;
          platform_share: number;
          select_share: number;
          founding_share: number;
          status: "calculated" | "paid" | "disputed";
          paid_at: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["revenue_distributions"]["Row"]> & { referral_id: string; placement_fee: number };
        Update: Partial<Database["public"]["Tables"]["revenue_distributions"]["Row"]>;
      };

      // CANDIDATE REFERRAL SYSTEM TABLES
      candidates: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          linkedin_url: string | null;
          current_company: string | null;
          current_title: string | null;
          years_experience: number | null;
          location: string | null;
          salary_expectation_min: number | null;
          salary_expectation_max: number | null;
          currency: string | null;
          availability: "immediate" | "2_weeks" | "1_month" | "3_months" | "not_looking" | null;
          work_authorization: "us_citizen" | "green_card" | "h1b" | "opt" | "requires_sponsorship" | null;
          resume_url: string | null;
          resume_filename: string | null;
          ai_summary: string | null;
          skills: Record<string, unknown> | null;
          preferences: Record<string, unknown> | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["candidates"]["Row"]> & { email: string };
        Update: Partial<Database["public"]["Tables"]["candidates"]["Row"]>;
      };
      candidate_referrals: {
        Row: {
          id: string;
          referral_id: string;
          candidate_id: string;
          referrer_notes: string | null;
          relationship_to_candidate: string | null;
          referral_reason: string | null;
          candidate_consent_given: boolean | null;
          candidate_consent_date: string | null;
          referrer_confidence: number | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["candidate_referrals"]["Row"]> & { referral_id: string; candidate_id: string };
        Update: Partial<Database["public"]["Tables"]["candidate_referrals"]["Row"]>;
      };
      ai_match_analysis: {
        Row: {
          id: string;
          candidate_id: string;
          job_id: string;
          ai_match_score: number | null;
          skill_match_score: number | null;
          experience_match_score: number | null;
          culture_fit_score: number | null;
          ai_analysis: Record<string, unknown> | null;
          missing_skills: Record<string, unknown> | null;
          strengths: Record<string, unknown> | null;
          concerns: Record<string, unknown> | null;
          recommendation: "strong_match" | "good_match" | "possible_match" | "poor_match" | null;
          analyzed_at: string | null;
          ai_model_version: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["ai_match_analysis"]["Row"]> & { candidate_id: string; job_id: string };
        Update: Partial<Database["public"]["Tables"]["ai_match_analysis"]["Row"]>;
      };
      candidate_interactions: {
        Row: {
          id: string;
          candidate_id: string;
          job_id: string | null;
          interaction_type: "referral_submitted" | "resume_uploaded" | "screening_call" | "client_interview" | "offer_extended" | "offer_accepted" | "offer_declined" | "withdrawn";
          notes: string | null;
          scheduled_for: string | null;
          completed_at: string | null;
          outcome: string | null;
          next_steps: string | null;
          created_by: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["candidate_interactions"]["Row"]> & { candidate_id: string; interaction_type: string };
        Update: Partial<Database["public"]["Tables"]["candidate_interactions"]["Row"]>;
      };
      candidate_skills: {
        Row: {
          id: string;
          candidate_id: string;
          skill_name: string;
          skill_category: string | null;
          proficiency_level: number | null;
          years_experience: number | null;
          verified: boolean | null;
          source: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["candidate_skills"]["Row"]> & { candidate_id: string; skill_name: string };
        Update: Partial<Database["public"]["Tables"]["candidate_skills"]["Row"]>;
      };
      payment_transactions: {
        Row: {
          id: string;
          client_id: string | null;
          stripe_session_id: string | null;
          stripe_invoice_id: string | null;
          amount: number | null;
          currency: string | null;
          type: "job_posting" | "subscription" | null;
          subscription_tier: SubscriptionTier | null;
          status: "pending" | "completed" | "failed" | "refunded" | null;
          metadata: Record<string, unknown> | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["payment_transactions"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["payment_transactions"]["Row"]>;
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          email_notifications: boolean | null;
          push_notifications: boolean | null;
          marketing_emails: boolean | null;
          two_factor_enabled: boolean | null;
          profile_visibility: "public" | "private" | "network" | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["user_settings"]["Row"]> & { user_id: string };
        Update: Partial<Database["public"]["Tables"]["user_settings"]["Row"]>;
      };
      profile_extensions: {
        Row: {
          id: string;
          user_id: string;
          role: UserRole;
          data: Record<string, unknown> | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["profile_extensions"]["Row"]> & { user_id: string; role: UserRole };
        Update: Partial<Database["public"]["Tables"]["profile_extensions"]["Row"]>;
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          description: string;
          status: "open" | "in_progress" | "closed" | "resolved" | null;
          priority: "low" | "medium" | "high" | "urgent" | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["support_tickets"]["Row"]> & { user_id: string; subject: string; description: string };
        Update: Partial<Database["public"]["Tables"]["support_tickets"]["Row"]>;
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
