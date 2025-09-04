/**
 * Constants and configuration for job posting forms
 */

export const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY", "SGD"];

export const EXPERIENCE_LEVELS = [
  { value: "junior", label: "Junior (0-2 years)" },
  { value: "mid", label: "Mid-level (2-5 years)" },
  { value: "senior", label: "Senior (5+ years)" },
  { value: "executive", label: "Executive/Leadership" }
] as const;

export const JOB_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "contract", label: "Contract" },
  { value: "part_time", label: "Part-time" }
] as const;

export const LOCATION_TYPES = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" }
] as const;

export const WORK_AUTHORIZATION_OPTIONS = [
  "US Citizen",
  "Green Card",
  "H1B",
  "OPT",
  "Requires Sponsorship"
];

export const AVAILABILITY_OPTIONS = [
  { value: "immediately", label: "Immediately" },
  { value: "2_weeks", label: "2 weeks" },
  { value: "1_month", label: "1 month" },
  { value: "3_months", label: "3 months" },
  { value: "not_looking", label: "Not looking" }
] as const;

// Form validation limits
export const FORM_LIMITS = {
  title: {
    min: 5,
    max: 100
  },
  description: {
    min: 50,
    max: 5000
  },
  requirement: {
    max: 500
  },
  skills: {
    min: 1,
    max: 20
  },
  salary: {
    min: 0,
    max: 1000000
  }
} as const;

// Default form placeholders
export const PLACEHOLDERS = {
  title: "e.g. Senior Software Engineer",
  description: "Describe the role, responsibilities, and what makes this opportunity exciting...",
  requirement: "e.g. 3+ years experience with React",
  skill: "Type a skill and press Enter",
  location_city: "City, Country",
  location_city_remote: "Anywhere"
} as const;

// Help text for form fields
export const HELP_TEXT = {
  title: "A clear, descriptive title helps attract the right candidates",
  description: "Include key responsibilities, required qualifications, and what makes this role unique",
  requirements: "List specific requirements and mark which ones are essential vs. nice-to-have",
  skills: "Add relevant technical and soft skills to help with candidate matching",
  salary: "Providing salary range increases application rates by 30%",
  location: "Be specific about work arrangements and any location requirements",
  subscription_tier: "Higher tiers get better visibility and priority placement"
} as const;

// Form section configuration
export const FORM_SECTIONS = [
  {
    id: "details",
    title: "Job Details",
    description: "Basic information about the position",
    icon: "Users"
  },
  {
    id: "requirements",
    title: "Requirements", 
    description: "Skills and qualifications needed",
    icon: "CheckCircle"
  },
  {
    id: "subscription",
    title: "Subscription",
    description: "Choose your posting tier",
    icon: "Star"
  }
] as const;