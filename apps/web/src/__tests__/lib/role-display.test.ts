/**
 * Unit tests for role-display utility
 *
 * These tests ensure the role display mapping layer works correctly
 * and provides proper error handling for invalid inputs.
 */

import {
  getRoleDisplay,
  getRoleFromDisplay,
  getRoleDescription,
  isValidDatabaseRole,
  isValidDisplayRole,
  getAllDisplayRoles,
  getAllDatabaseRoles,
  ROLE_DISPLAY_MAP,
  DISPLAY_TO_DATABASE_MAP,
  ROLE_LABELS,
  type DatabaseRole,
  type DisplayRole,
} from '../../lib/role-display';

describe('role-display utility', () => {
  describe('ROLE_DISPLAY_MAP', () => {
    it('maps founding_circle to Founder', () => {
      expect(ROLE_DISPLAY_MAP.founding_circle).toBe('Founder');
    });

    it('maps select_circle to Referrer', () => {
      expect(ROLE_DISPLAY_MAP.select_circle).toBe('Referrer');
    });

    it('maps client to Client', () => {
      expect(ROLE_DISPLAY_MAP.client).toBe('Client');
    });

    it('maps candidate to Candidate', () => {
      expect(ROLE_DISPLAY_MAP.candidate).toBe('Candidate');
    });

    it('has exactly 4 role mappings', () => {
      expect(Object.keys(ROLE_DISPLAY_MAP)).toHaveLength(4);
    });
  });

  describe('DISPLAY_TO_DATABASE_MAP', () => {
    it('maps Founder to founding_circle', () => {
      expect(DISPLAY_TO_DATABASE_MAP.Founder).toBe('founding_circle');
    });

    it('maps Referrer to select_circle', () => {
      expect(DISPLAY_TO_DATABASE_MAP.Referrer).toBe('select_circle');
    });

    it('maps Client to client', () => {
      expect(DISPLAY_TO_DATABASE_MAP.Client).toBe('client');
    });

    it('maps Candidate to candidate', () => {
      expect(DISPLAY_TO_DATABASE_MAP.Candidate).toBe('candidate');
    });

    it('has exactly 4 display mappings', () => {
      expect(Object.keys(DISPLAY_TO_DATABASE_MAP)).toHaveLength(4);
    });
  });

  describe('ROLE_LABELS', () => {
    it('has exactly 4 role labels', () => {
      expect(ROLE_LABELS).toHaveLength(4);
    });

    it('contains founding_circle label', () => {
      const label = ROLE_LABELS.find((r) => r.value === 'founding_circle');
      expect(label).toBeDefined();
      expect(label?.label).toBe('Founder');
      expect(label?.description).toContain('founder');
    });

    it('contains select_circle label', () => {
      const label = ROLE_LABELS.find((r) => r.value === 'select_circle');
      expect(label).toBeDefined();
      expect(label?.label).toBe('Referrer');
      expect(label?.description).toContain('referrer');
    });

    it('contains client label', () => {
      const label = ROLE_LABELS.find((r) => r.value === 'client');
      expect(label).toBeDefined();
      expect(label?.label).toBe('Client');
      expect(label?.description).toContain('Companies');
    });

    it('contains candidate label', () => {
      const label = ROLE_LABELS.find((r) => r.value === 'candidate');
      expect(label).toBeDefined();
      expect(label?.label).toBe('Candidate');
      expect(label?.description).toContain('Job seekers');
    });

    it('all labels have required fields', () => {
      ROLE_LABELS.forEach((label) => {
        expect(label.value).toBeDefined();
        expect(label.label).toBeDefined();
        expect(label.description).toBeDefined();
        expect(typeof label.value).toBe('string');
        expect(typeof label.label).toBe('string');
        expect(typeof label.description).toBe('string');
      });
    });
  });

  describe('getRoleDisplay', () => {
    it('converts founding_circle to Founder', () => {
      expect(getRoleDisplay('founding_circle')).toBe('Founder');
    });

    it('converts select_circle to Referrer', () => {
      expect(getRoleDisplay('select_circle')).toBe('Referrer');
    });

    it('converts client to Client', () => {
      expect(getRoleDisplay('client')).toBe('Client');
    });

    it('converts candidate to Candidate', () => {
      expect(getRoleDisplay('candidate')).toBe('Candidate');
    });

    it('throws error for null role', () => {
      expect(() => getRoleDisplay(null)).toThrow('Invalid role: role is null or undefined');
    });

    it('throws error for undefined role', () => {
      expect(() => getRoleDisplay(undefined)).toThrow('Invalid role: role is null or undefined');
    });

    it('throws error for invalid role', () => {
      // @ts-expect-error Testing invalid input
      expect(() => getRoleDisplay('invalid_role')).toThrow('Invalid database role');
    });

    it('throws error for empty string', () => {
      // @ts-expect-error Testing invalid input
      expect(() => getRoleDisplay('')).toThrow('Invalid role: role is null or undefined');
    });
  });

  describe('getRoleFromDisplay', () => {
    it('converts Founder to founding_circle', () => {
      expect(getRoleFromDisplay('Founder')).toBe('founding_circle');
    });

    it('converts Referrer to select_circle', () => {
      expect(getRoleFromDisplay('Referrer')).toBe('select_circle');
    });

    it('converts Client to client', () => {
      expect(getRoleFromDisplay('Client')).toBe('client');
    });

    it('converts Candidate to candidate', () => {
      expect(getRoleFromDisplay('Candidate')).toBe('candidate');
    });

    it('throws error for invalid display role', () => {
      // @ts-expect-error Testing invalid input
      expect(() => getRoleFromDisplay('Invalid')).toThrow('Invalid display role');
    });

    it('throws error for empty string', () => {
      // @ts-expect-error Testing invalid input
      expect(() => getRoleFromDisplay('')).toThrow('Invalid display role');
    });

    it('is case-sensitive', () => {
      // @ts-expect-error Testing case sensitivity
      expect(() => getRoleFromDisplay('founder')).toThrow('Invalid display role');
    });
  });

  describe('getRoleDescription', () => {
    it('returns description for founding_circle', () => {
      const description = getRoleDescription('founding_circle');
      expect(description).toBeDefined();
      expect(typeof description).toBe('string');
      expect(description.length).toBeGreaterThan(0);
    });

    it('returns description for select_circle', () => {
      const description = getRoleDescription('select_circle');
      expect(description).toBeDefined();
      expect(typeof description).toBe('string');
      expect(description.length).toBeGreaterThan(0);
    });

    it('returns description for client', () => {
      const description = getRoleDescription('client');
      expect(description).toBeDefined();
      expect(typeof description).toBe('string');
      expect(description.length).toBeGreaterThan(0);
    });

    it('returns description for candidate', () => {
      const description = getRoleDescription('candidate');
      expect(description).toBeDefined();
      expect(typeof description).toBe('string');
      expect(description.length).toBeGreaterThan(0);
    });

    it('throws error for invalid role', () => {
      // @ts-expect-error Testing invalid input
      expect(() => getRoleDescription('invalid')).toThrow('Invalid database role');
    });
  });

  describe('isValidDatabaseRole', () => {
    it('returns true for founding_circle', () => {
      expect(isValidDatabaseRole('founding_circle')).toBe(true);
    });

    it('returns true for select_circle', () => {
      expect(isValidDatabaseRole('select_circle')).toBe(true);
    });

    it('returns true for client', () => {
      expect(isValidDatabaseRole('client')).toBe(true);
    });

    it('returns true for candidate', () => {
      expect(isValidDatabaseRole('candidate')).toBe(true);
    });

    it('returns false for invalid role', () => {
      expect(isValidDatabaseRole('invalid_role')).toBe(false);
    });

    it('returns false for null', () => {
      expect(isValidDatabaseRole(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidDatabaseRole(undefined)).toBe(false);
    });

    it('returns false for number', () => {
      expect(isValidDatabaseRole(123)).toBe(false);
    });

    it('returns false for object', () => {
      expect(isValidDatabaseRole({})).toBe(false);
    });

    it('returns false for array', () => {
      expect(isValidDatabaseRole([])).toBe(false);
    });
  });

  describe('isValidDisplayRole', () => {
    it('returns true for Founder', () => {
      expect(isValidDisplayRole('Founder')).toBe(true);
    });

    it('returns true for Referrer', () => {
      expect(isValidDisplayRole('Referrer')).toBe(true);
    });

    it('returns true for Client', () => {
      expect(isValidDisplayRole('Client')).toBe(true);
    });

    it('returns true for Candidate', () => {
      expect(isValidDisplayRole('Candidate')).toBe(true);
    });

    it('returns false for invalid display role', () => {
      expect(isValidDisplayRole('Invalid')).toBe(false);
    });

    it('returns false for database role value', () => {
      expect(isValidDisplayRole('founding_circle')).toBe(false);
    });

    it('returns false for null', () => {
      expect(isValidDisplayRole(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidDisplayRole(undefined)).toBe(false);
    });

    it('is case-sensitive', () => {
      expect(isValidDisplayRole('founder')).toBe(false);
      expect(isValidDisplayRole('FOUNDER')).toBe(false);
    });
  });

  describe('getAllDisplayRoles', () => {
    it('returns an array of 4 display roles', () => {
      const roles = getAllDisplayRoles();
      expect(roles).toHaveLength(4);
      expect(Array.isArray(roles)).toBe(true);
    });

    it('includes all display roles', () => {
      const roles = getAllDisplayRoles();
      expect(roles).toContain('Founder');
      expect(roles).toContain('Referrer');
      expect(roles).toContain('Client');
      expect(roles).toContain('Candidate');
    });

    it('returns only display roles, not database roles', () => {
      const roles = getAllDisplayRoles();
      expect(roles).not.toContain('founding_circle');
      expect(roles).not.toContain('select_circle');
      expect(roles).not.toContain('client');
      expect(roles).not.toContain('candidate');
    });

    it('returns a new array each time', () => {
      const roles1 = getAllDisplayRoles();
      const roles2 = getAllDisplayRoles();
      expect(roles1).not.toBe(roles2); // Different array instances
      expect(roles1).toEqual(roles2); // But same values
    });
  });

  describe('getAllDatabaseRoles', () => {
    it('returns an array of 4 database roles', () => {
      const roles = getAllDatabaseRoles();
      expect(roles).toHaveLength(4);
      expect(Array.isArray(roles)).toBe(true);
    });

    it('includes all database roles', () => {
      const roles = getAllDatabaseRoles();
      expect(roles).toContain('founding_circle');
      expect(roles).toContain('select_circle');
      expect(roles).toContain('client');
      expect(roles).toContain('candidate');
    });

    it('returns only database roles, not display roles', () => {
      const roles = getAllDatabaseRoles();
      expect(roles).not.toContain('Founder');
      expect(roles).not.toContain('Referrer');
    });

    it('returns a new array each time', () => {
      const roles1 = getAllDatabaseRoles();
      const roles2 = getAllDatabaseRoles();
      expect(roles1).not.toBe(roles2); // Different array instances
      expect(roles1).toEqual(roles2); // But same values
    });
  });

  describe('bidirectional conversion', () => {
    it('converting db->display->db returns original value for founding_circle', () => {
      const original: DatabaseRole = 'founding_circle';
      const display = getRoleDisplay(original);
      const backToDb = getRoleFromDisplay(display);
      expect(backToDb).toBe(original);
    });

    it('converting db->display->db returns original value for select_circle', () => {
      const original: DatabaseRole = 'select_circle';
      const display = getRoleDisplay(original);
      const backToDb = getRoleFromDisplay(display);
      expect(backToDb).toBe(original);
    });

    it('converting db->display->db returns original value for client', () => {
      const original: DatabaseRole = 'client';
      const display = getRoleDisplay(original);
      const backToDb = getRoleFromDisplay(display);
      expect(backToDb).toBe(original);
    });

    it('converting db->display->db returns original value for candidate', () => {
      const original: DatabaseRole = 'candidate';
      const display = getRoleDisplay(original);
      const backToDb = getRoleFromDisplay(display);
      expect(backToDb).toBe(original);
    });

    it('converting display->db->display returns original value for Founder', () => {
      const original: DisplayRole = 'Founder';
      const dbRole = getRoleFromDisplay(original);
      const backToDisplay = getRoleDisplay(dbRole);
      expect(backToDisplay).toBe(original);
    });

    it('converting display->db->display returns original value for Referrer', () => {
      const original: DisplayRole = 'Referrer';
      const dbRole = getRoleFromDisplay(original);
      const backToDisplay = getRoleDisplay(dbRole);
      expect(backToDisplay).toBe(original);
    });
  });

  describe('type safety', () => {
    it('ROLE_DISPLAY_MAP keys match DatabaseRole type', () => {
      const keys = Object.keys(ROLE_DISPLAY_MAP) as DatabaseRole[];
      keys.forEach((key) => {
        expect(isValidDatabaseRole(key)).toBe(true);
      });
    });

    it('ROLE_DISPLAY_MAP values match DisplayRole type', () => {
      const values = Object.values(ROLE_DISPLAY_MAP) as DisplayRole[];
      values.forEach((value) => {
        expect(isValidDisplayRole(value)).toBe(true);
      });
    });

    it('DISPLAY_TO_DATABASE_MAP keys match DisplayRole type', () => {
      const keys = Object.keys(DISPLAY_TO_DATABASE_MAP) as DisplayRole[];
      keys.forEach((key) => {
        expect(isValidDisplayRole(key)).toBe(true);
      });
    });

    it('DISPLAY_TO_DATABASE_MAP values match DatabaseRole type', () => {
      const values = Object.values(DISPLAY_TO_DATABASE_MAP) as DatabaseRole[];
      values.forEach((value) => {
        expect(isValidDatabaseRole(value)).toBe(true);
      });
    });
  });

  describe('consistency checks', () => {
    it('ROLE_LABELS matches ROLE_DISPLAY_MAP', () => {
      ROLE_LABELS.forEach((label) => {
        expect(ROLE_DISPLAY_MAP[label.value]).toBe(label.label);
      });
    });

    it('ROLE_LABELS matches DISPLAY_TO_DATABASE_MAP', () => {
      ROLE_LABELS.forEach((label) => {
        expect(DISPLAY_TO_DATABASE_MAP[label.label]).toBe(label.value);
      });
    });

    it('all ROLE_LABELS have unique values', () => {
      const values = ROLE_LABELS.map((r) => r.value);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    it('all ROLE_LABELS have unique labels', () => {
      const labels = ROLE_LABELS.map((r) => r.label);
      const uniqueLabels = new Set(labels);
      expect(uniqueLabels.size).toBe(labels.length);
    });
  });
});
