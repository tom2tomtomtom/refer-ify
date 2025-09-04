/**
 * JobPostingForm Components
 * 
 * Barrel export file for all JobPostingForm related components.
 * These components work together to create a comprehensive job posting
 * interface with modular, reusable sections.
 */

export { JobBasicInfoSection } from './JobBasicInfoSection';
export { JobRequirementsSection } from './JobRequirementsSection';
export { JobSubscriptionSection } from './JobSubscriptionSection';
export { SkillsSelector } from './SkillsSelector';

// Re-export types that might be needed by consumers
export type { JobFormData, JobRequirement } from '@/hooks/jobs/useJobFormData';