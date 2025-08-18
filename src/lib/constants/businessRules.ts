/**
 * Business Rules Constants for Refer-ify Platform
 * 
 * CRITICAL: These rules define the core platform integrity.
 * Any violation of these rules breaks the referral-only business model.
 * 
 * Reference: .claude-suite/CLAUDE.md - Business Logic Rules
 * Last Updated: January 2025
 */

export const BUSINESS_RULES = {
  // Core Platform Rules (NEVER CHANGE)
  PLATFORM_TYPE: 'REFERRAL_ONLY' as const, // See .claude-suite/CLAUDE.md
  CANDIDATE_ACCESS: 'NO_BROWSING' as const, // Candidates cannot browse jobs
  REFERRAL_BASIS: 'PERSONAL_RELATIONSHIPS_ONLY' as const,
  QUALITY_STANDARD: 'EXECUTIVE_GRADE' as const,

  // User Role Hierarchy
  ROLE_HIERARCHY: {
    FOUNDING_CIRCLE: 4, // Highest access
    SELECT_CIRCLE: 3,
    CLIENT: 2,
    CANDIDATE: 1, // Lowest access (no browsing)
    ADMIN: 5 // Platform admin
  } as const,

  // Access Control Rules
  ACCESS_RULES: {
    // Job visibility by role
    JOB_VISIBILITY: {
      founding_circle: ['connect', 'priority', 'exclusive'] as const,
      select_circle: ['connect', 'priority'] as const, // No exclusive access
      client: ['own_jobs'] as const, // Only their own posted jobs
      candidate: [] as const, // No job visibility
      admin: ['connect', 'priority', 'exclusive'] as const
    },

    // Feature access by role
    FEATURE_ACCESS: {
      founding_circle: ['post_jobs', 'view_all_jobs', 'manage_network', 'invite_members', 'view_analytics'] as const,
      select_circle: ['view_tier_jobs', 'submit_referrals', 'view_earnings'] as const,
      client: ['post_jobs', 'view_referrals', 'manage_subscriptions'] as const,
      candidate: ['view_profile', 'manage_consent'] as const, // Very limited access
      admin: ['manage_platform', 'view_all_data', 'override_permissions'] as const
    }
  } as const,

  // Financial Rules
  FINANCIAL_RULES: {
    // Fee distribution percentages
    FEE_DISTRIBUTION: {
      PLATFORM_FEE: 45, // Platform keeps 45%
      SELECT_CIRCLE_FEE: 40, // Select Circle earns 40%
      FOUNDING_CIRCLE_NETWORK_FEE: 15, // Founding Circle earns 15% from network
      FOUNDING_CIRCLE_DIRECT_FEE: 40 // Founding Circle earns 40% for direct referrals
    } as const,

    // Subscription tiers and pricing
    SUBSCRIPTION_TIERS: {
      connect: { price: 500, currency: 'USD', access_level: 1 },
      priority: { price: 1500, currency: 'USD', access_level: 2 },
      exclusive: { price: 3000, currency: 'USD', access_level: 3 }
    } as const
  } as const,

  // Network Rules
  NETWORK_RULES: {
    MAX_SELECT_CIRCLE_PER_FOUNDING: 40, // Max 40 Select Circle members per Founding Circle
    INVITATION_ONLY: true, // Platform is invitation-only
    RELATIONSHIP_REQUIRED: true // All referrals must be from personal relationships
  } as const,

  // Quality Standards
  QUALITY_STANDARDS: {
    MIN_EXPERIENCE_YEARS: 2, // Minimum experience for executive roles
    RESUME_FILE_MAX_SIZE_MB: 10, // Max resume file size
    ALLOWED_RESUME_TYPES: ['pdf', 'doc', 'docx'] as const,
    REFERRAL_REVIEW_TIME_HOURS: 48 // Max time for client to review referral
  } as const

} as const;

/**
 * Validation Functions for Business Rules
 */

export const validateBusinessRules = {
  /**
   * Check if user can access specific job tier
   */
  canAccessJobTier: (userRole: string, jobTier: string): boolean => {
    const allowedTiers = BUSINESS_RULES.ACCESS_RULES.JOB_VISIBILITY[userRole as keyof typeof BUSINESS_RULES.ACCESS_RULES.JOB_VISIBILITY];
    return allowedTiers?.includes(jobTier as any) ?? false;
  },

  /**
   * Check if user can use specific feature
   */
  canUseFeature: (userRole: string, feature: string): boolean => {
    const allowedFeatures = BUSINESS_RULES.ACCESS_RULES.FEATURE_ACCESS[userRole as keyof typeof BUSINESS_RULES.ACCESS_RULES.FEATURE_ACCESS];
    return allowedFeatures?.includes(feature as any) ?? false;
  },

  /**
   * Prevent job board violations - throws error if attempted
   */
  enforceReferralOnly: (action: string, userRole: string): void => {
    const jobBoardViolations = ['browse_jobs', 'apply_directly', 'search_jobs', 'view_job_board'];
    
    if (jobBoardViolations.includes(action) && userRole === 'candidate') {
      throw new Error(
        `Business Rule Violation: ${BUSINESS_RULES.PLATFORM_TYPE} platform - ` +
        `candidates cannot ${action}. See .claude-suite/CLAUDE.md for rules.`
      );
    }
  },

  /**
   * Calculate referral fees according to business rules
   */
  calculateReferralFee: (
    placementFee: number, 
    referrerRole: 'select_circle' | 'founding_circle',
    isDirect: boolean = true
  ): number => {
    if (referrerRole === 'select_circle') {
      return Math.round(placementFee * (BUSINESS_RULES.FINANCIAL_RULES.FEE_DISTRIBUTION.SELECT_CIRCLE_FEE / 100));
    }
    
    if (referrerRole === 'founding_circle') {
      const feePercent = isDirect 
        ? BUSINESS_RULES.FINANCIAL_RULES.FEE_DISTRIBUTION.FOUNDING_CIRCLE_DIRECT_FEE
        : BUSINESS_RULES.FINANCIAL_RULES.FEE_DISTRIBUTION.FOUNDING_CIRCLE_NETWORK_FEE;
      return Math.round(placementFee * (feePercent / 100));
    }
    
    return 0;
  },

  /**
   * Validate subscription access level
   */
  validateSubscriptionAccess: (subscriptionTier: string, requestedAccess: string): boolean => {
    const tier = BUSINESS_RULES.FINANCIAL_RULES.SUBSCRIPTION_TIERS[subscriptionTier as keyof typeof BUSINESS_RULES.FINANCIAL_RULES.SUBSCRIPTION_TIERS];
    
    if (!tier) return false;

    // Map access levels to job tiers
    const accessMapping: Record<number, string[]> = {
      1: ['connect'],
      2: ['connect', 'priority'],
      3: ['connect', 'priority', 'exclusive']
    };

    return accessMapping[tier.access_level]?.includes(requestedAccess) ?? false;
  }
};

/**
 * Type definitions for business rules
 */
export type UserRole = keyof typeof BUSINESS_RULES.ACCESS_RULES.JOB_VISIBILITY;
export type JobTier = 'connect' | 'priority' | 'exclusive';
export type SubscriptionTier = keyof typeof BUSINESS_RULES.FINANCIAL_RULES.SUBSCRIPTION_TIERS;
export type ReferrerRole = 'select_circle' | 'founding_circle';

/**
 * Runtime validation helpers
 */
export const isValidUserRole = (role: string): role is UserRole => {
  return role in BUSINESS_RULES.ACCESS_RULES.JOB_VISIBILITY;
};

export const isValidJobTier = (tier: string): tier is JobTier => {
  return ['connect', 'priority', 'exclusive'].includes(tier);
};

export const isValidSubscriptionTier = (tier: string): tier is SubscriptionTier => {
  return tier in BUSINESS_RULES.FINANCIAL_RULES.SUBSCRIPTION_TIERS;
};

/**
 * Error messages for business rule violations
 */
export const BUSINESS_RULE_ERRORS = {
  PLATFORM_VIOLATION: `Platform Violation: ${BUSINESS_RULES.PLATFORM_TYPE} - candidates cannot browse jobs`,
  ROLE_ACCESS_DENIED: 'Access denied: insufficient role permissions',
  SUBSCRIPTION_ACCESS_DENIED: 'Access denied: subscription tier insufficient',
  INVALID_REFERRAL_BASIS: `Referral must be based on ${BUSINESS_RULES.REFERRAL_BASIS}`,
  NETWORK_LIMIT_EXCEEDED: `Network limit exceeded: max ${BUSINESS_RULES.NETWORK_RULES.MAX_SELECT_CIRCLE_PER_FOUNDING} Select Circle members per Founding Circle`
} as const;