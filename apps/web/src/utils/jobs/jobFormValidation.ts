import { JobFormData } from '@/hooks/jobs/useJobFormData';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Comprehensive validation for job form data
 */
export function validateJobForm(formData: JobFormData): ValidationResult {
  const errors: ValidationError[] = [];

  // Required fields validation
  validateRequiredFields(formData, errors);
  
  // Salary validation
  validateSalaryRange(formData, errors);
  
  // Requirements validation
  validateRequirements(formData, errors);
  
  // Skills validation
  validateSkills(formData, errors);
  
  // Location validation
  validateLocation(formData, errors);

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateRequiredFields(formData: JobFormData, errors: ValidationError[]) {
  if (!formData.title?.trim()) {
    errors.push({ field: 'title', message: 'Job title is required' });
  }

  if (!formData.description?.trim()) {
    errors.push({ field: 'description', message: 'Job description is required' });
  }

  if (formData.title && formData.title.length > 100) {
    errors.push({ field: 'title', message: 'Job title must be 100 characters or less' });
  }

  if (formData.description && formData.description.length < 50) {
    errors.push({ field: 'description', message: 'Job description should be at least 50 characters' });
  }
}

function validateSalaryRange(formData: JobFormData, errors: ValidationError[]) {
  const { salary_min, salary_max } = formData;

  if (salary_min < 0) {
    errors.push({ field: 'salary_min', message: 'Minimum salary cannot be negative' });
  }

  if (salary_max < 0) {
    errors.push({ field: 'salary_max', message: 'Maximum salary cannot be negative' });
  }

  if (salary_min > 0 && salary_max > 0 && salary_min >= salary_max) {
    errors.push({ field: 'salary', message: 'Minimum salary must be less than maximum salary' });
  }

  // Reasonable salary limits (in thousands)
  if (salary_max > 1000000) {
    errors.push({ field: 'salary_max', message: 'Maximum salary seems unusually high' });
  }
}

function validateRequirements(formData: JobFormData, errors: ValidationError[]) {
  const validRequirements = formData.requirements.filter(req => req.text.trim());

  if (validRequirements.length === 0) {
    errors.push({ field: 'requirements', message: 'At least one job requirement is needed' });
  }

  // Check for overly long requirements
  formData.requirements.forEach((req, index) => {
    if (req.text.length > 500) {
      errors.push({ 
        field: `requirement_${index}`, 
        message: 'Individual requirements should be 500 characters or less' 
      });
    }
  });
}

function validateSkills(formData: JobFormData, errors: ValidationError[]) {
  if (formData.skills.length === 0) {
    errors.push({ field: 'skills', message: 'At least one skill should be specified' });
  }

  if (formData.skills.length > 20) {
    errors.push({ field: 'skills', message: 'Maximum 20 skills allowed' });
  }

  // Check for duplicate skills (case insensitive)
  const skillsLower = formData.skills.map(s => s.toLowerCase());
  const duplicates = skillsLower.filter((skill, index) => 
    skillsLower.indexOf(skill) !== index
  );

  if (duplicates.length > 0) {
    errors.push({ field: 'skills', message: 'Duplicate skills found' });
  }
}

function validateLocation(formData: JobFormData, errors: ValidationError[]) {
  if (formData.location_type === 'onsite' || formData.location_type === 'hybrid') {
    if (!formData.location_city?.trim()) {
      errors.push({ 
        field: 'location_city', 
        message: 'Location is required for on-site and hybrid positions' 
      });
    }
  }
}

/**
 * Validate individual field
 */
export function validateField(
  field: keyof JobFormData, 
  value: unknown, 
  formData: JobFormData
): ValidationError | null {
  switch (field) {
    case 'title':
      if (!value || typeof value !== 'string' || !value.trim()) {
        return { field, message: 'Job title is required' };
      }
      if (value.length > 100) return { field, message: 'Job title must be 100 characters or less' };
      break;

    case 'description':
      if (!value || typeof value !== 'string' || !value.trim()) {
        return { field, message: 'Job description is required' };
      }
      if (value.length < 50) return { field, message: 'Job description should be at least 50 characters' };
      break;

    case 'salary_min':
      if (typeof value === 'number' && value < 0) {
        return { field, message: 'Minimum salary cannot be negative' };
      }
      if (typeof value === 'number' && formData.salary_max > 0 && value >= formData.salary_max) {
        return { field, message: 'Minimum salary must be less than maximum salary' };
      }
      break;

    case 'salary_max':
      if (typeof value === 'number' && value < 0) {
        return { field, message: 'Maximum salary cannot be negative' };
      }
      if (typeof value === 'number' && value > 1000000) {
        return { field, message: 'Maximum salary seems unusually high' };
      }
      if (typeof value === 'number' && formData.salary_min > 0 && formData.salary_min >= value) {
        return { field, message: 'Maximum salary must be greater than minimum salary' };
      }
      break;

    case 'location_city':
      if ((formData.location_type === 'onsite' || formData.location_type === 'hybrid') && 
          (!value || typeof value !== 'string' || !value.trim())) {
        return { field, message: 'Location is required for on-site and hybrid positions' };
      }
      break;
  }

  return null;
}

/**
 * Check if form is ready for draft saving
 */
export function canSaveAsDraft(formData: JobFormData): boolean {
  return !!(formData.title?.trim() && formData.description?.trim());
}

/**
 * Check if form is ready for publication
 */
export function canPublish(formData: JobFormData): boolean {
  const validation = validateJobForm(formData);
  return validation.isValid;
}