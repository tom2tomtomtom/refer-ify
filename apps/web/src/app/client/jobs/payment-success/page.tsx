"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [jobId, setJobId] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get session ID from URL params
        const sessionId = searchParams.get("session_id");
        if (!sessionId) {
          throw new Error("No session ID found");
        }

        // Get pending job data from session storage
        const pendingJobDataStr = sessionStorage.getItem("pendingJobData");
        if (!pendingJobDataStr) {
          throw new Error("No pending job data found");
        }

        const pendingJobData = JSON.parse(pendingJobDataStr);

        // Create the job now that payment is complete
        const jobResponse = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...pendingJobData,
            payment_session_id: sessionId
          })
        });

        if (!jobResponse.ok) {
          throw new Error("Failed to create job after payment");
        }

        const jobData = await jobResponse.json();
        setJobId(jobData.job.id);

        // Clear session storage
        sessionStorage.removeItem("pendingJobData");

        setStatus("success");
        toast.success("Job posted successfully! Payment confirmed.");

      } catch (error) {
        console.error("Post-payment processing error:", error);
        setStatus("error");
        toast.error("There was an issue processing your job posting. Please contact support.");
      }
    };

    processPayment();
  }, [searchParams]);

  const handleContinue = () => {
    if (jobId) {
      router.push(`/client/jobs/${jobId}`);
    } else {
      router.push("/client/jobs");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          {status === "processing" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
              <CardTitle>Processing Your Payment</CardTitle>
              <CardDescription>
                Please wait while we confirm your payment and create your job posting...
              </CardDescription>
            </>
          )}
          
          {status === "success" && (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <CardTitle className="text-green-700">Payment Successful!</CardTitle>
              <CardDescription>
                Your job posting has been created and is now live on the platform.
              </CardDescription>
            </>
          )}
          
          {status === "error" && (
            <>
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <CardTitle className="text-red-700">Payment Processing Error</CardTitle>
              <CardDescription>
                There was an issue processing your payment or creating your job posting. 
                Please contact support for assistance.
              </CardDescription>
            </>
          )}
        </CardHeader>
        
        {status !== "processing" && (
          <CardContent>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleContinue} className="w-full">
                {status === "success" ? "View Your Job" : "Go to Jobs"}
              </Button>
              {status === "error" && (
                <Button variant="outline" onClick={() => router.push("/contact")}>
                  Contact Support
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}