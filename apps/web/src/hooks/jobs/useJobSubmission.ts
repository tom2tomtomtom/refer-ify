import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { JobFormData } from './useJobFormData';
import { formatErrorForToast } from '@/lib/error-messages';

interface UseJobSubmissionOptions {
  onSuccess?: (jobId?: string) => void;
  onError?: (error: unknown) => void;
}

/**
 * Custom hook for handling job submission and payment flow
 * 
 * Manages the complex job submission process including draft saving,
 * payment processing, and error handling. Abstracts the submission
 * logic away from UI components.
 * 
 * @param options - Configuration options for submission handling
 * @returns Object with submission functions and state
 */
export function useJobSubmission(options: UseJobSubmissionOptions = {}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submitDraft = useCallback(async (formData: JobFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        status: "draft"
      };

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to save draft");

      const data = await response.json();
      toast.success("Job saved as draft!");
      
      options.onSuccess?.(data.job?.id);
      router.push("/client/jobs");
      
      return data;
    } catch (error) {
      const errorMessage = formatErrorForToast(error, { action: 'job_create' });
      toast.error(errorMessage);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [router, options]);

  const initiatePaymentFlow = useCallback(async (formData: JobFormData) => {
    setLoading(true);
    try {
      // Get user email for payment
      const userResponse = await fetch("/api/auth/user");
      const userData = await userResponse.json();
      
      if (!userData.user?.email) {
        throw new Error("User email not found");
      }

      // Create payment session
      const paymentResponse = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "job_posting",
          subscription_tier: formData.subscription_tier,
          customerEmail: userData.user.email,
          job_data: {
            title: formData.title,
            subscription_tier: formData.subscription_tier
          }
        })
      });

      if (!paymentResponse.ok) {
        throw new Error("Failed to create payment session");
      }

      const paymentData = await paymentResponse.json();
      
      // Store job data in session storage for post-payment processing
      sessionStorage.setItem('pendingJobData', JSON.stringify({
        ...formData,
        status: "active"
      }));

      // Redirect to Stripe Checkout
      window.location.href = paymentData.url;
      
      return paymentData;
    } catch (error) {
      const errorMessage = formatErrorForToast(error, { action: 'job_create' });
      toast.error(errorMessage);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const submitForPublication = useCallback(async (formData: JobFormData) => {
    return await initiatePaymentFlow(formData);
  }, [initiatePaymentFlow]);

  return {
    loading,
    submitDraft,
    submitForPublication,
    initiatePaymentFlow
  };
}