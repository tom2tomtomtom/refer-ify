/**
 * Role Display Mapping Layer
 *
 * This module provides a safe abstraction between database role values
 * and user-facing display strings. It allows us to change terminology
 * in the UI without modifying database schemas, RLS policies, or auth logic.
 *
 * WHY THIS EXISTS:
 * - Database keeps original enum values (founding_circle, select_circle)
 * - UI displays new terminology (Founder, Referrer)
 * - Zero risk to authentication, permissions, or existing data
 * - Easy to rollback if needed
 * - Gradual migration path to future database changes
 *
 * WHEN TO USE:
 * - Use getRoleDisplay() when showing roles to users in UI
 * - Use getRoleFromDisplay() when converting user input to database values
 * - Use ROLE_LABELS for dropdown options, badges, filters
 * - Keep using database role values in API calls, queries, and auth logic
 *
 * MIGRATION PLAN:
 * - Phase 1 (NOW): UI uses display layer, database unchanged
 * - Phase 2 (3+ months): Add display_role column to database
 * - Phase 3 (6+ months): Gradually migrate queries to use display_role
 * - Phase 4 (12+ months): Deprecate original role column
 */

import type { UserRole } from './supabase/database.types';

/**
 * Database role types - these match the database enum exactly
 * DO NOT change these values - they must match the database
 */
export type DatabaseRole = UserRole;

/**
 * Display role types - these are what users see in the UI
 * These can be changed freely without database risk
 */
export type DisplayRole = 'Founder' | 'Referrer' | 'Client' | 'Candidate';

/**
 * Mapping from database roles to display roles
 * This is the source of truth for role display names
 */
export const ROLE_DISPLAY_MAP: Record<DatabaseRole, DisplayRole> = {
  founding_circle: 'Founder',
  select_circle: 'Referrer',
  client: 'Client',
  candidate: 'Candidate',
} as const;

/**
 * Reverse mapping from display roles to database roles
 * Used when converting user selections back to database values
 */
export const DISPLAY_TO_DATABASE_MAP: Record<DisplayRole, DatabaseRole> = {
  Founder: 'founding_circle',
  Referrer: 'select_circle',
  Client: 'client',
  Candidate: 'candidate',
} as const;

/**
 * Role labels for UI components (dropdowns, badges, filters)
 * Provides both the display value and the underlying database value
 */
export const ROLE_LABELS: Array<{ value: DatabaseRole; label: DisplayRole; description: string }> = [
  {
    value: 'founding_circle',
    label: 'Founder',
    description: 'Platform founders with full access and revenue sharing',
  },
  {
    value: 'select_circle',
    label: 'Referrer',
    description: 'Premium referrers with priority access to opportunities',
  },
  {
    value: 'client',
    label: 'Client',
    description: 'Companies posting jobs and hiring candidates',
  },
  {
    value: 'candidate',
    label: 'Candidate',
    description: 'Job seekers with professional profiles',
  },
];

/**
 * Convert a database role to a user-facing display string
 *
 * @param dbRole - The role value from the database
 * @returns The user-friendly display name
 * @throws Error if the role is not recognized
 *
 * @example
 * ```typescript
 * const displayName = getRoleDisplay('founding_circle'); // Returns: "Founder"
 * const displayName = getRoleDisplay('select_circle');   // Returns: "Referrer"
 * ```
 */
export function getRoleDisplay(dbRole: DatabaseRole | null | undefined): DisplayRole {
  if (!dbRole) {
    throw new Error('Invalid role: role is null or undefined');
  }

  const displayRole = ROLE_DISPLAY_MAP[dbRole];

  if (!displayRole) {
    throw new Error(`Invalid database role: ${dbRole}`);
  }

  return displayRole;
}

/**
 * Convert a display role string back to the database role value
 *
 * @param displayRole - The user-facing role name
 * @returns The database role enum value
 * @throws Error if the display role is not recognized
 *
 * @example
 * ```typescript
 * const dbRole = getRoleFromDisplay('Founder');   // Returns: "founding_circle"
 * const dbRole = getRoleFromDisplay('Referrer');  // Returns: "select_circle"
 * ```
 */
export function getRoleFromDisplay(displayRole: DisplayRole): DatabaseRole {
  const dbRole = DISPLAY_TO_DATABASE_MAP[displayRole];

  if (!dbRole) {
    throw new Error(`Invalid display role: ${displayRole}`);
  }

  return dbRole;
}

/**
 * Get the description for a given database role
 *
 * @param dbRole - The role value from the database
 * @returns The role description
 *
 * @example
 * ```typescript
 * const description = getRoleDescription('founding_circle');
 * // Returns: "Platform founders with full access and revenue sharing"
 * ```
 */
export function getRoleDescription(dbRole: DatabaseRole): string {
  const roleLabel = ROLE_LABELS.find((r) => r.value === dbRole);

  if (!roleLabel) {
    throw new Error(`Invalid database role: ${dbRole}`);
  }

  return roleLabel.description;
}

/**
 * Check if a value is a valid database role
 *
 * @param value - The value to check
 * @returns True if the value is a valid database role
 *
 * @example
 * ```typescript
 * isValidDatabaseRole('founding_circle'); // Returns: true
 * isValidDatabaseRole('invalid_role');    // Returns: false
 * ```
 */
export function isValidDatabaseRole(value: unknown): value is DatabaseRole {
  return (
    typeof value === 'string' &&
    (value === 'founding_circle' ||
      value === 'select_circle' ||
      value === 'client' ||
      value === 'candidate')
  );
}

/**
 * Check if a value is a valid display role
 *
 * @param value - The value to check
 * @returns True if the value is a valid display role
 *
 * @example
 * ```typescript
 * isValidDisplayRole('Founder');  // Returns: true
 * isValidDisplayRole('Invalid');  // Returns: false
 * ```
 */
export function isValidDisplayRole(value: unknown): value is DisplayRole {
  return (
    typeof value === 'string' &&
    (value === 'Founder' || value === 'Referrer' || value === 'Client' || value === 'Candidate')
  );
}

/**
 * Get all display roles as an array
 * Useful for generating dropdown options
 *
 * @returns Array of all display roles
 *
 * @example
 * ```typescript
 * const roles = getAllDisplayRoles();
 * // Returns: ['Founder', 'Referrer', 'Client', 'Candidate']
 * ```
 */
export function getAllDisplayRoles(): DisplayRole[] {
  return ROLE_LABELS.map((r) => r.label);
}

/**
 * Get all database roles as an array
 * Useful for queries and filters
 *
 * @returns Array of all database roles
 *
 * @example
 * ```typescript
 * const roles = getAllDatabaseRoles();
 * // Returns: ['founding_circle', 'select_circle', 'client', 'candidate']
 * ```
 */
export function getAllDatabaseRoles(): DatabaseRole[] {
  return ROLE_LABELS.map((r) => r.value);
}
