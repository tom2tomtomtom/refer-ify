"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  FileText, 
  Download,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { toast } from "sonner";

interface Subscription {
  id: string;
  tier: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  stripe_subscription_id: string;
}

interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  type: string;
  subscription_tier: string;
  status: string;
  created_at: string;
  metadata: any;
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      // Fetch subscription data
      const subResponse = await fetch("/api/payments");
      if (subResponse.ok) {
        const subData = await subResponse.json();
        setSubscription(subData.subscription);
      }

      // Fetch payment transactions
      const transResponse = await fetch("/api/services?service=billing");
      if (transResponse.ok) {
        const transData = await transResponse.json();
        setTransactions(transData.transactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch billing data:", error);
      toast.error("Failed to load billing information");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionAction = async (action: "create" | "cancel" | "upgrade") => {
    try {
      if (action === "create") {
        // Redirect to subscription creation
        const response = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "subscription",
            subscription_tier: "connect", // Default tier
            customerEmail: "user@example.com" // Get from user context
          })
        });

        if (response.ok) {
          const data = await response.json();
          window.location.href = data.url;
        }
      } else if (action === "cancel") {
        // Handle subscription cancellation
        const response = await fetch("/api/billing/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription_id: subscription?.stripe_subscription_id
          })
        });

        if (response.ok) {
          toast.success("Subscription cancelled successfully");
          fetchBillingData(); // Refresh data
        }
      }
    } catch (error) {
      console.error("Subscription action failed:", error);
      toast.error("Failed to update subscription");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "past_due": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTierFeatures = (tier: string) => {
    const features = {
      connect: ["Basic job posting", "Standard visibility", "Email notifications"],
      priority: ["Featured listing", "Advanced filters", "Priority support", "Enhanced analytics"],
      exclusive: ["Premium placement", "Dedicated support", "Custom branding", "Full analytics"]
    };
    return features[tier as keyof typeof features] || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading billing information...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscriptions</h1>
        <p className="text-muted-foreground">
          Manage your subscription and view payment history
        </p>
      </div>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold capitalize">
                      {subscription.tier} Plan
                    </h3>
                    <Badge className={getStatusColor(subscription.status)}>
                      {subscription.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Active until {formatDate(subscription.current_period_end)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSubscriptionAction("upgrade")}
                  >
                    Upgrade
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleSubscriptionAction("cancel")}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Plan Features</h4>
                <ul className="space-y-1">
                  {getTierFeatures(subscription.tier).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground mb-4">
                Subscribe to one of our plans to unlock premium features
              </p>
              <Button onClick={() => handleSubscriptionAction("create")}>
                Choose a Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>
            View and download your payment receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {transaction.type === "subscription" ? (
                        <Calendar className="h-4 w-4" />
                      ) : (
                        <DollarSign className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {transaction.type === "subscription" 
                          ? `${transaction.subscription_tier} Subscription` 
                          : transaction.metadata?.job_title || "Job Posting"
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                    <div className="font-semibold">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payment History</h3>
              <p className="text-muted-foreground">
                Your payment transactions will appear here once you make a purchase
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}