'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

/**
 * Form validation schema for referrer applications.
 * Enforces strict validation rules for all 13 fields.
 */
const referrerApplicationSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  email: z.string().email('Invalid email address'),
  linkedinUrl: z.string()
    .url('Invalid URL format')
    .refine((url) => url.toLowerCase().includes('linkedin.com'), {
      message: 'Must be a valid LinkedIn profile URL',
    }),
  yearsExperience: z.enum(['10-15 years', '15-20 years', '20+ years'], {
    required_error: 'Please select your years of experience',
  }),
  currentCompany: z.string().max(200, 'Company name too long').optional(),
  currentTitle: z.string().max(200, 'Title too long').optional(),
  jobTypes: z.string().min(1, 'Please specify at least one job type'),
  industries: z.string().min(1, 'Please specify at least one industry'),
  networkDescription: z.string().max(1000, 'Description too long (max 1000 characters)').optional(),
  motivation: z.string().max(1000, 'Motivation too long (max 1000 characters)').optional(),
  referralSource: z.string().max(200, 'Source too long').optional(),
  referredByEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
});

type ReferrerApplicationForm = z.infer<typeof referrerApplicationSchema>;

/**
 * Referrer Application Page
 *
 * Public-facing form for senior executives to apply to join the Select Circle.
 * Features comprehensive validation, error handling, and success states.
 */
export default function ApplyReferrerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ReferrerApplicationForm>({
    resolver: zodResolver(referrerApplicationSchema),
  });

  const yearsExperience = watch('yearsExperience');

  /**
   * Handle form submission
   * Sends data to API endpoint with comprehensive error handling
   */
  const onSubmit = async (data: ReferrerApplicationForm) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/applications/referrer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application');
      }

      setSubmitSuccess(true);
    } catch (error) {
      console.error('Application submission error:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state UI
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-green-900">Application Submitted!</CardTitle>
              <CardDescription className="text-green-700 text-base mt-2">
                Thank you for your interest in joining the Refer-ify Select Circle.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-700">
                We have received your application and will review it carefully. Our team will get back to you within 3-5 business days.
              </p>
              <p className="text-sm text-gray-600">
                Please check your email (including spam folder) for confirmation and next steps.
              </p>
              <div className="pt-4">
                <Link href="/">
                  <Button>Return to Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main form UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Badge variant="secondary" className="mb-4">Select Circle Application</Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
            Join Our Referrer Network
          </h1>
          <p className="text-lg text-gray-600">
            Apply to become a Select Circle member and connect top executives with their next opportunity.
          </p>
        </div>

        {/* Requirements Card */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Select Circle Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>10+ years of senior executive experience</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Extensive professional network in your industry</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Active LinkedIn profile with 500+ connections</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Commitment to quality referrals and candidate experience</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
            <CardDescription>
              Please provide accurate information. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Error Alert */}
              {submitError && (
                <div className="p-4 rounded-md bg-red-50 border border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-900 mb-1">Submission Failed</h4>
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...register('firstName')}
                      placeholder="John"
                      aria-invalid={!!errors.firstName}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...register('lastName')}
                      placeholder="Doe"
                      aria-invalid={!!errors.lastName}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="john.doe@example.com"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* LinkedIn URL */}
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn Profile URL *</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    {...register('linkedinUrl')}
                    placeholder="https://linkedin.com/in/johndoe"
                    aria-invalid={!!errors.linkedinUrl}
                  />
                  {errors.linkedinUrl && (
                    <p className="text-sm text-red-600">{errors.linkedinUrl.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Please provide your full LinkedIn profile URL (e.g., linkedin.com/in/yourname)
                  </p>
                </div>
              </div>

              {/* Professional Experience */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Experience</h3>

                {/* Years of Experience */}
                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Senior Executive Experience *</Label>
                  <Select
                    value={yearsExperience}
                    onValueChange={(value) => setValue('yearsExperience', value as any)}
                  >
                    <SelectTrigger id="yearsExperience" className="w-full" aria-invalid={!!errors.yearsExperience}>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10-15 years">10-15 years</SelectItem>
                      <SelectItem value="15-20 years">15-20 years</SelectItem>
                      <SelectItem value="20+ years">20+ years</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.yearsExperience && (
                    <p className="text-sm text-red-600">{errors.yearsExperience.message}</p>
                  )}
                </div>

                {/* Current Company */}
                <div className="space-y-2">
                  <Label htmlFor="currentCompany">Current Company (Optional)</Label>
                  <Input
                    id="currentCompany"
                    {...register('currentCompany')}
                    placeholder="Acme Corp"
                    aria-invalid={!!errors.currentCompany}
                  />
                  {errors.currentCompany && (
                    <p className="text-sm text-red-600">{errors.currentCompany.message}</p>
                  )}
                </div>

                {/* Current Title */}
                <div className="space-y-2">
                  <Label htmlFor="currentTitle">Current Title (Optional)</Label>
                  <Input
                    id="currentTitle"
                    {...register('currentTitle')}
                    placeholder="Chief Technology Officer"
                    aria-invalid={!!errors.currentTitle}
                  />
                  {errors.currentTitle && (
                    <p className="text-sm text-red-600">{errors.currentTitle.message}</p>
                  )}
                </div>
              </div>

              {/* Referral Expertise */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Referral Expertise</h3>

                {/* Job Types */}
                <div className="space-y-2">
                  <Label htmlFor="jobTypes">Job Types You Can Support *</Label>
                  <Textarea
                    id="jobTypes"
                    {...register('jobTypes')}
                    placeholder="e.g., Executive Leadership, Engineering Management, Product Leadership, Sales Leadership"
                    rows={3}
                    aria-invalid={!!errors.jobTypes}
                  />
                  {errors.jobTypes && (
                    <p className="text-sm text-red-600">{errors.jobTypes.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    List the types of executive roles you have connections for (comma-separated)
                  </p>
                </div>

                {/* Industries */}
                <div className="space-y-2">
                  <Label htmlFor="industries">Industries You Specialize In *</Label>
                  <Textarea
                    id="industries"
                    {...register('industries')}
                    placeholder="e.g., Technology, Healthcare, Finance, SaaS, Enterprise Software"
                    rows={3}
                    aria-invalid={!!errors.industries}
                  />
                  {errors.industries && (
                    <p className="text-sm text-red-600">{errors.industries.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    List the industries where you have the strongest network (comma-separated)
                  </p>
                </div>

                {/* Network Description */}
                <div className="space-y-2">
                  <Label htmlFor="networkDescription">Network Description (Optional)</Label>
                  <Textarea
                    id="networkDescription"
                    {...register('networkDescription')}
                    placeholder="Describe the size and scope of your professional network, including any notable connections or communities you're part of..."
                    rows={4}
                    aria-invalid={!!errors.networkDescription}
                  />
                  {errors.networkDescription && (
                    <p className="text-sm text-red-600">{errors.networkDescription.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Help us understand the depth and breadth of your network (max 1000 characters)
                  </p>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>

                {/* Motivation */}
                <div className="space-y-2">
                  <Label htmlFor="motivation">Why do you want to join our referrer network? (Optional)</Label>
                  <Textarea
                    id="motivation"
                    {...register('motivation')}
                    placeholder="Share your motivation for joining the Select Circle and what value you believe you can bring..."
                    rows={4}
                    aria-invalid={!!errors.motivation}
                  />
                  {errors.motivation && (
                    <p className="text-sm text-red-600">{errors.motivation.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Max 1000 characters</p>
                </div>

                {/* Referral Source */}
                <div className="space-y-2">
                  <Label htmlFor="referralSource">How did you hear about Refer-ify? (Optional)</Label>
                  <Input
                    id="referralSource"
                    {...register('referralSource')}
                    placeholder="e.g., LinkedIn, colleague, industry event"
                    aria-invalid={!!errors.referralSource}
                  />
                  {errors.referralSource && (
                    <p className="text-sm text-red-600">{errors.referralSource.message}</p>
                  )}
                </div>

                {/* Referred By Email */}
                <div className="space-y-2">
                  <Label htmlFor="referredByEmail">Were you referred by an existing member? (Optional)</Label>
                  <Input
                    id="referredByEmail"
                    type="email"
                    {...register('referredByEmail')}
                    placeholder="referrer@example.com"
                    aria-invalid={!!errors.referredByEmail}
                  />
                  {errors.referredByEmail && (
                    <p className="text-sm text-red-600">{errors.referredByEmail.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    If an existing Select Circle member referred you, please provide their email
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-8"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </div>

              {/* Terms Notice */}
              <p className="text-xs text-gray-500 text-center">
                By submitting this application, you agree to our{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8 border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 text-center">
              Have questions about the application process?{' '}
              <Link href="/contact" className="text-blue-600 hover:underline font-medium">
                Contact our team
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
