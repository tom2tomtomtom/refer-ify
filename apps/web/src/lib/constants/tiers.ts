/**
 * Subscription Tier Constants
 * 
 * Defines the subscription tiers, pricing, features, and visual styling
 * for the Refer-ify platform. Used across job posting, billing, and 
 * marketing components.
 */

export type SubscriptionTier = "connect" | "priority" | "exclusive";

export interface TierFeature {
  price: string;
  features: string[];
  color: string;
}

export type TierFeatures = Record<SubscriptionTier, TierFeature>;

/**
 * Complete tier configuration with pricing and features
 */
export const TIER_FEATURES: TierFeatures = {
  connect: {
    price: "$500",
    features: ["Basic job posting", "Standard visibility", "Email notifications"],
    color: "bg-blue-50 border-blue-200"
  },
  priority: {
    price: "$1,500", 
    features: ["Featured listing", "Advanced filters", "Priority support", "Enhanced analytics"],
    color: "bg-purple-50 border-purple-200"
  },
  exclusive: {
    price: "$3,000",
    features: ["Premium placement", "Dedicated support", "Custom branding", "Full analytics", "Priority matching"],
    color: "bg-orange-50 border-orange-200"
  }
};

/**
 * Tier pricing for programmatic access
 */
export const TIER_PRICING: Record<SubscriptionTier, number> = {
  connect: 500,
  priority: 1500,
  exclusive: 3000
};

/**
 * Tier display names for UI
 */
export const TIER_NAMES: Record<SubscriptionTier, string> = {
  connect: "Connect",
  priority: "Priority",
  exclusive: "Exclusive"
};

/**
 * Get tier feature information
 */
export function getTierFeatures(tier: SubscriptionTier): TierFeature {
  return TIER_FEATURES[tier];
}

/**
 * Get tier pricing in cents for Stripe
 */
export function getTierPriceInCents(tier: SubscriptionTier): number {
  return TIER_PRICING[tier] * 100;
}

/**
 * Check if tier includes specific feature
 */
export function tierHasFeature(tier: SubscriptionTier, feature: string): boolean {
  return TIER_FEATURES[tier].features.includes(feature);
}