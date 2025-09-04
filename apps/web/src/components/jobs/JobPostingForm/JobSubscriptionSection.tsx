import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { TIER_FEATURES, SubscriptionTier } from "@/lib/constants/tiers";
import { JobFormData } from "@/hooks/jobs/useJobFormData";
import { HELP_TEXT } from "@/utils/jobs/jobFormConstants";

interface JobSubscriptionSectionProps {
  formData: JobFormData;
  onUpdate: (field: keyof JobFormData, value: unknown) => void;
  errors?: Array<{field: string; message: string}>;
}

/**
 * JobSubscriptionSection - Subscription tier selection form section
 * 
 * Handles the subscription tier selection with pricing information,
 * feature comparisons, and visual tier indicators. Provides users
 * with clear information about each tier's benefits and pricing.
 */
export function JobSubscriptionSection({ 
  formData, 
  onUpdate, 
  errors = [] 
}: JobSubscriptionSectionProps) {
  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  const handleTierSelection = (tier: SubscriptionTier) => {
    onUpdate("subscription_tier", tier);
  };

  const subscriptionError = getFieldError("subscription_tier");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Choose Your Subscription Tier
        </CardTitle>
        <CardDescription>
          Select the posting tier that best fits your needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(TIER_FEATURES).map(([tier, info]) => (
            <TierCard
              key={tier}
              tier={tier as SubscriptionTier}
              info={info}
              isSelected={formData.subscription_tier === tier}
              onSelect={handleTierSelection}
            />
          ))}
        </div>

        {subscriptionError && (
          <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-3">
            {subscriptionError}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          {HELP_TEXT.subscription_tier}
        </div>

        {/* Current selection summary */}
        {formData.subscription_tier && (
          <div className="bg-muted/50 border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium capitalize">
                  {formData.subscription_tier} Plan Selected
                </p>
                <p className="text-sm text-muted-foreground">
                  {TIER_FEATURES[formData.subscription_tier].price} - {TIER_FEATURES[formData.subscription_tier].features.length} features included
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {TIER_FEATURES[formData.subscription_tier].price}
                </p>
                <p className="text-xs text-muted-foreground">per posting</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TierCardProps {
  tier: SubscriptionTier;
  info: typeof TIER_FEATURES[SubscriptionTier];
  isSelected: boolean;
  onSelect: (tier: SubscriptionTier) => void;
}

function TierCard({ tier, info, isSelected, onSelect }: TierCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected 
          ? `${info.color} ring-2 ring-primary` 
          : "hover:shadow-md"
      }`}
      onClick={() => onSelect(tier)}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="capitalize">{tier}</span>
          {tier === "exclusive" && <Star className="h-5 w-5 text-orange-500" />}
        </CardTitle>
        <CardDescription className="text-2xl font-bold">
          {info.price}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {info.features.map((feature, index) => (
            <li key={index} className="text-sm flex items-center gap-2">
              <div className="h-1.5 w-1.5 bg-primary rounded-full flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        {isSelected && (
          <div className="mt-3 pt-3 border-t border-primary/20">
            <p className="text-xs text-primary font-medium">✓ Selected</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}