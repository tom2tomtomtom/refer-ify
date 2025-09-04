import { useState, useCallback } from 'react';
import { SubscriptionTier } from '@/lib/constants/tiers';

export interface JobRequirement {
  id: string;
  text: string;
  required: boolean;
}

export interface JobFormData {
  title: string;
  description: string;
  requirements: JobRequirement[];
  location_type: "remote" | "hybrid" | "onsite";
  location_city: string;
  salary_min: number;
  salary_max: number;
  currency: string;
  skills: string[];
  experience_level: "junior" | "mid" | "senior" | "executive";
  job_type: "full_time" | "contract" | "part_time";
  subscription_tier: SubscriptionTier;
}

const INITIAL_FORM_DATA: JobFormData = {
  title: "",
  description: "",
  requirements: [{ id: "1", text: "", required: true }],
  location_type: "remote",
  location_city: "",
  salary_min: 0,
  salary_max: 0,
  currency: "USD",
  skills: [],
  experience_level: "mid",
  job_type: "full_time",
  subscription_tier: "connect"
};

/**
 * Custom hook for managing job form data and validation
 * 
 * Handles form state management, field updates, and validation logic
 * for job posting forms. Provides a clean interface for form components.
 * 
 * @param initialData - Optional initial form data
 * @returns Object with form data, update functions, and validation
 */
export function useJobFormData(initialData?: Partial<JobFormData>) {
  const [formData, setFormData] = useState<JobFormData>({
    ...INITIAL_FORM_DATA,
    ...initialData
  });

  const updateField = useCallback((field: keyof JobFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateRequirement = useCallback((id: string, text: string, required?: boolean) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map(req => 
        req.id === id ? { ...req, text, ...(required !== undefined && { required }) } : req
      )
    }));
  }, []);

  const addRequirement = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, { 
        id: Date.now().toString(), 
        text: "", 
        required: false 
      }]
    }));
  }, []);

  const removeRequirement = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req.id !== id)
    }));
  }, []);

  const validate = useCallback(() => {
    const errors: Array<{field: string; message: string}> = [];

    if (!formData.title.trim()) {
      errors.push({ field: 'title', message: 'Job title is required' });
    }

    if (!formData.description.trim()) {
      errors.push({ field: 'description', message: 'Job description is required' });
    }

    if (formData.salary_min > 0 && formData.salary_max > 0 && formData.salary_min >= formData.salary_max) {
      errors.push({ field: 'salary', message: 'Minimum salary must be less than maximum salary' });
    }

    const validRequirements = formData.requirements.filter(req => req.text.trim());
    if (validRequirements.length === 0) {
      errors.push({ field: 'requirements', message: 'At least one job requirement is needed' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [formData]);

  const getCleanFormData = useCallback(() => {
    return {
      ...formData,
      requirements: formData.requirements.filter(req => req.text.trim())
    };
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
  }, []);

  return {
    formData,
    updateField,
    updateRequirement,
    addRequirement,
    removeRequirement,
    validate,
    getCleanFormData,
    resetForm,
    isDirty: JSON.stringify(formData) !== JSON.stringify(INITIAL_FORM_DATA)
  };
}