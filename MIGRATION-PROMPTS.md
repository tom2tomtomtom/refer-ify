# Claude Code Prompts - Quick Reference

**Purpose:** Copy-paste ready prompts for each migration phase
**Usage:** Execute these prompts in order with Claude Code

---

## 📋 EXECUTION SEQUENCE

1. ✅ **PROMPT 1** → Impact Analysis (Read-only, no changes)
2. ✅ **PROMPT 2** → Create Mapping Layer (Creates new file + tests)
3. ✅ **PROMPT 3** → Update UI Components (Safe display changes)
4. ✅ **PROMPT 4** → Update Marketing Content (Business content)
5. ✅ **PROMPT 5** → Create Referrer Form (New feature)
6. ✅ **PROMPT 6** → Hide Founder Application (Feature flag)
7. ✅ **PROMPT 7** → Update Tests (Validation)
8. ⚠️ **PROMPT 8** → Database Migration (ONLY after 3+ months)

---

## 🔍 PROMPT 1: Impact Analysis

**Status:** Not Started
**Risk Level:** NONE (read-only)
**Estimated Time:** 10-15 minutes

**Copy & Paste This:**

```
Analyze the Refer-ify codebase and provide a comprehensive impact report for the following terminology changes:

OLD → NEW TERMINOLOGY:
- "Founding Circle" → "Founder" (as a role/member type)
- "Select Circle" → "Referrer" or "Member"
- Keep "Client" and "Candidate" unchanged

Search for all occurrences in:
1. Database schema files (supabase/migrations/*.sql)
2. TypeScript types and interfaces (src/types/*)
3. React components (src/components/**/*)
4. API routes (src/app/api/**/*)
5. Test files (src/__tests__/**/*)
6. Marketing pages (src/app/(marketing)/**/*)
7. Configuration files

For each file found, report:
- File path
- Number of occurrences
- Context (enum values, hardcoded strings, UI labels, comments)
- Risk level (HIGH/MEDIUM/LOW) based on whether it affects:
  * Database schemas/migrations (HIGH)
  * Authentication/RLS policies (HIGH)
  * Payment logic (HIGH)
  * UI labels only (LOW)
  * Test assertions (MEDIUM)

DO NOT make any changes yet. Just provide the impact analysis report.
```

**After Running:**
- [ ] Review the report carefully
- [ ] Save the report for reference
- [ ] Note any high-risk areas
- [ ] Proceed only if comfortable with scope

---

## 🛠️ PROMPT 2: Create Role Display Mapping Layer

**Status:** Not Started
**Risk Level:** LOW
**Estimated Time:** 15-20 minutes
**Prerequisites:** Prompt 1 completed

**Copy & Paste This:**

```
I need to implement a terminology mapping layer without breaking existing database logic.

REQUIREMENTS:
1. Create a new utility file: src/lib/role-display.ts
2. Implement these functions:
   - getRoleDisplay(dbRole: string): string
   - getRoleFromDisplay(displayRole: string): string
   - ROLE_DISPLAY_MAP constant

MAPPING RULES:
- Database role "founding_circle" → Display as "Founder"
- Database role "select_circle" → Display as "Referrer"
- Database role "client" → Display as "Client" (unchanged)
- Database role "candidate" → Display as "Candidate" (unchanged)

3. Add TypeScript types:
   - DatabaseRole type (union of existing enum values)
   - DisplayRole type (union of new display strings)

4. Include JSDoc comments explaining:
   - Why we keep old database values (backwards compatibility)
   - When to use display vs database roles
   - Migration plan for future

5. Export a ROLE_LABELS constant for UI dropdowns/badges

EXAMPLE USAGE PATTERN:
```typescript
// In components
const displayRole = getRoleDisplay(user.role); // "Founder" instead of "founding_circle"

// In API calls
const dbRole = getRoleFromDisplay("Founder"); // "founding_circle" for database
```

Create this utility with full TypeScript safety and comprehensive error handling.
```

**After Running:**
- [ ] Review the created file: `src/lib/role-display.ts`
- [ ] Run `npm run type-check` to verify no TypeScript errors
- [ ] Run `npm test` to verify all tests pass
- [ ] Commit changes: `git commit -m "feat: add role display mapping layer"`

---

## 🎨 PROMPT 3: Update UI Components

**Status:** Not Started
**Risk Level:** LOW
**Estimated Time:** 30-45 minutes
**Prerequisites:** Prompt 2 completed, all tests passing

**Copy & Paste This:**

```
Update all React components to use the new role display mapping layer.

SCOPE: src/components/**/*.tsx

REQUIREMENTS:
1. Import the role display utilities:
   import { getRoleDisplay, ROLE_LABELS } from '@/lib/role-display'

2. Replace hardcoded role strings with mapped values:
   BEFORE: {user.role === 'founding_circle' && 'Founding Circle'}
   AFTER: {getRoleDisplay(user.role)}

3. Update role badges/labels to use ROLE_LABELS constant

4. Search for these patterns to replace:
   - "Founding Circle" (hardcoded strings)
   - "Select Circle" (hardcoded strings)
   - founding_circle (enum references in JSX)
   - select_circle (enum references in JSX)

5. DO NOT change:
   - Database queries or mutations
   - API route logic
   - RLS policy references
   - Type definitions that match database schema

6. Focus on these component directories:
   - src/components/dashboard/*
   - src/components/navigation/*
   - src/components/auth/*
   - src/components/jobs/*
   - src/components/referrals/*

7. Preserve all existing logic, only update display strings

VALIDATION:
- Run TypeScript compiler after changes
- Ensure no database queries are affected
- Test that role-based conditionals still work correctly

Show me each file you plan to modify before making changes.
```

**After Running:**
- [ ] Review all modified files
- [ ] Run `npm run type-check`
- [ ] Run `npm test`
- [ ] Start dev server: `npm run dev`
- [ ] Manually test role display in browser
- [ ] Commit: `git commit -m "feat: update UI components with role display mapping"`

---

## 📄 PROMPT 4: Update Marketing Content

**Status:** Not Started
**Risk Level:** LOW
**Estimated Time:** 45-60 minutes
**Prerequisites:** Prompt 3 completed
**⚠️ Required:** CEO content document ready

**Copy & Paste This:**

```
Update all marketing pages with the new CEO-provided content and terminology.

SCOPE:
- src/app/(marketing)/about/page.tsx
- src/app/(marketing)/pricing/page.tsx
- src/app/(marketing)/how-it-works/page.tsx
- src/app/(marketing)/story/page.tsx (if exists, or create it)

NEW CONTENT TO IMPLEMENT:

**FOR COMPANIES PAGE** (pricing/page.tsx or create for-companies/page.tsx):
- Headline: "Great people know, great people."
- Value prop: "Get the best people for your team with pre-vetted, highly regarded recommendations from our founders; senior executives and their connections..."

**PRICING SECTION** - Replace subscription model with:
- Headline: "NEVER AGAIN PAY A PERCENTAGE OF SALARY FOR HIRING!"
- New pricing tiers:
  * $100-150K salary = $15,000 flat fee per hire
  * $150-200K salary = $20,000 flat fee per hire
  * $200-300K salary = $30,000 flat fee per hire
  * $300-400K salary = $39,000 flat fee per hire
  * $400K+ salary = $45,000 flat fee per hire

- Platform fees:
  * Start Up / Small Business: $500/month (was "Connect")
  * Mid-Sized Business: $1,500/month (was "Priority")
  * Enterprise Business: $3,000/month (was "Exclusive")

**FAQ SECTION** - Add these Q&As:
[Paste the entire FAQ section from CEO notes]

**STORY PAGE** - Create or update with:
[Paste "THE REFER-IFY STORY" section from CEO notes]

DESIGN REQUIREMENTS:
- Match existing Refer-ify design system
- Use shadcn/ui components where appropriate
- Ensure mobile responsiveness
- Keep typography hierarchy consistent
- Use existing color palette and spacing

Show me the proposed structure for each page before implementing.
```

**After Running:**
- [ ] Review all updated marketing pages
- [ ] Test on mobile devices/responsive mode
- [ ] Verify all links work
- [ ] Check typography and spacing
- [ ] Run `npm run type-check`
- [ ] Run `npm test`
- [ ] Commit: `git commit -m "feat: update marketing content and pricing model"`

---

## 📝 PROMPT 5: Create Referrer Application Form

**Status:** Not Started
**Risk Level:** MEDIUM (database changes)
**Estimated Time:** 60-90 minutes
**Prerequisites:** Prompt 4 completed

**Copy & Paste This:**

```
Create a new referrer application form based on CEO specifications.

LOCATION: src/app/(marketing)/apply-referrer/page.tsx

FORM FIELDS (in order):
1. First Name* (required, text input)
2. Last Name* (required, text input)
3. Email* (required, email input)
4. LinkedIn URL* (required, URL input with validation)
5. Years of Experience* (required, radio/select):
   - 10-15 years
   - 15-20 years
   - 20+ years
6. Current/Most Recent Company (optional, text input)
7. Current/Most Recent Job Title (optional, text input)
8. Job Types with Strong Connections* (required, multi-select or textarea):
   Placeholder: "E.g. Customer Experience, Data/Marketing Science, Design, Engineering, Finance, Marketing, Operations, Product, Sales, Other"
9. Industries with Strong Connections* (required, textarea)
10. Tell us about your Network (optional, textarea)
11. What excites you about becoming a Refer-ify member? (optional, textarea)
12. How did you hear about Refer-ify? (optional, text input)
13. Referred by a Founder/Member? Their email? (optional, email input)

REQUIREMENTS:
- Use React Hook Form for form management
- Implement Zod schema validation
- Use shadcn/ui Form components (consistent with existing forms)
- Add proper error handling and validation messages
- Success page/modal after submission
- Store submissions in Supabase table: referrer_applications
- Send notification email to admin on submission

DATABASE SCHEMA (create migration):
```sql
create table referrer_applications (
  id uuid primary key default uuid_generate_v4(),
  first_name text not null,
  last_name text not null,
  email text not null,
  linkedin_url text not null,
  years_experience text not null,
  current_company text,
  current_title text,
  job_types text not null,
  industries text not null,
  network_description text,
  motivation text,
  referral_source text,
  referred_by_email text,
  status text default 'pending', -- pending, approved, rejected
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

API ROUTE: src/app/api/applications/referrer/route.ts
- POST handler to create application
- Email notification to admin
- Input validation with Zod
- Error handling

Show me the form structure before implementation.
```

**After Running:**
- [ ] Review database migration
- [ ] Test migration locally
- [ ] Review form component
- [ ] Review API route
- [ ] Test form submission
- [ ] Verify email notifications
- [ ] Run `npm run type-check`
- [ ] Run `npm test`
- [ ] Commit: `git commit -m "feat: create referrer application form with validation"`

---

## 🚫 PROMPT 6: Hide Founder Application

**Status:** Not Started
**Risk Level:** MEDIUM
**Estimated Time:** 20-30 minutes
**Prerequisites:** Prompt 5 completed

**Copy & Paste This:**

```
Hide or remove the "Apply to become a Founder" functionality from the site.

APPROACH: Instead of deleting, add a feature flag for potential future use.

TASKS:
1. Search for all references to "founder application" or "founding circle application"
2. Identify these locations:
   - Navigation links
   - Marketing page CTAs
   - Application form pages
   - Database tables (keep but mark deprecated)

3. Implement feature flag:
   - Add to environment variables: NEXT_PUBLIC_ENABLE_FOUNDER_APPLICATIONS=false
   - Wrap founder application routes in conditional rendering
   - Update navigation to exclude founder application links

4. Add deprecation notice in code:
   ```typescript
   // DEPRECATED: Founder applications now invite-only
   // Keeping code for reference but hidden via feature flag
   // Remove after 6 months if not needed (date: [current date + 6 months])
   ```

5. Update any "Apply Now" CTAs on marketing pages to point to referrer application

DO NOT:
- Delete database migrations
- Remove existing founder application data
- Break links that might be bookmarked

Show me all locations found before making changes.
```

**After Running:**
- [ ] Verify feature flag added to `.env.example`
- [ ] Test that founder application is hidden
- [ ] Test that referrer application is accessible
- [ ] Verify no broken links
- [ ] Run `npm run type-check`
- [ ] Run `npm test`
- [ ] Commit: `git commit -m "feat: hide founder application with feature flag"`

---

## ✅ PROMPT 7: Update Test Suite

**Status:** Not Started
**Risk Level:** LOW
**Estimated Time:** 30-45 minutes
**Prerequisites:** Prompts 2-6 completed

**Copy & Paste This:**

```
Update the test suite to work with the new terminology mapping layer.

SCOPE: src/__tests__/**/*

STRATEGY:
- Keep testing database role values (founding_circle, select_circle)
- Add tests for display role mapping
- Update UI component tests to expect new display strings

TASKS:
1. Create new test file: src/__tests__/lib/role-display.test.ts
   - Test getRoleDisplay() for all roles
   - Test getRoleFromDisplay() for all display names
   - Test error handling for invalid inputs

2. Update component tests:
   - Find tests checking for "Founding Circle" text
   - Update expectations to "Founder"
   - Find tests checking for "Select Circle" text
   - Update expectations to "Referrer"

3. Update test fixtures/mocks:
   - Keep database role values in fixtures
   - Update expected display strings in assertions

4. Run full test suite and fix any failures

5. Update test documentation with note about role display layer

VALIDATION:
- All tests should pass
- Coverage should remain at 96.4% or higher
- No tests should directly check for old display strings

Show me test failures before fixing them so I can review the approach.
```

**After Running:**
- [ ] Verify new test file created
- [ ] Run `npm test` - all tests should pass
- [ ] Run `npm test -- --coverage` - coverage maintained
- [ ] Review test changes
- [ ] Commit: `git commit -m "test: update test suite for new terminology"`

---

## 🗄️ PROMPT 8: Database Migration (FUTURE ONLY)

**Status:** ⚠️ NOT READY - DO NOT EXECUTE YET
**Risk Level:** HIGH
**Estimated Time:** 60-90 minutes
**Prerequisites:**
- ALL previous prompts completed
- 3+ months of production stability
- Full database backup
- Stakeholder approval

**⚠️ CRITICAL: Only execute after 3+ months of stable UI changes**

**Copy & Paste This (ONLY WHEN READY):**

```
CRITICAL: Only execute this after all UI and business logic changes are tested and deployed for at least 3 months.

Create a non-breaking database migration to support new role terminology.

APPROACH: Additive changes only, no deletions or renames yet.

MIGRATION: supabase/migrations/[timestamp]_add_role_display_mapping.sql

```sql
-- Add display_role column (nullable initially for backwards compatibility)
alter table profiles
add column display_role text;

-- Populate display_role from existing role values
update profiles
set display_role = case
  when role = 'founding_circle' then 'Founder'
  when role = 'select_circle' then 'Referrer'
  when role = 'client' then 'Client'
  when role = 'candidate' then 'Candidate'
  else role
end;

-- Add check constraint for valid display roles
alter table profiles
add constraint valid_display_role
check (display_role in ('Founder', 'Referrer', 'Client', 'Candidate'));

-- Add index for display_role queries
create index idx_profiles_display_role on profiles(display_role);

-- Add comment explaining dual-role system
comment on column profiles.display_role is
'User-facing role name. Mapped from legacy role column for backwards compatibility. Eventually role column will be deprecated.';

-- Create view for easy querying with display names
create or replace view profiles_with_display as
select
  *,
  case
    when role = 'founding_circle' then 'Founder'
    when role = 'select_circle' then 'Referrer'
    else role
  end as computed_display_role
from profiles;
```

TESTING CHECKLIST:
- [ ] Migration runs without errors on development database
- [ ] All existing profiles have display_role populated
- [ ] RLS policies still work correctly
- [ ] No queries broken by new column
- [ ] Can rollback migration if needed

DO NOT:
- Drop or rename existing role column
- Change enum values
- Modify RLS policies yet
- Force non-null constraint on display_role

This is a bridge migration. Future migration will complete the transition.
```

**Before Running (MUST CHECK ALL):**
- [ ] 3+ months since Phase 5 completion
- [ ] Zero critical bugs in production
- [ ] Stakeholder approval obtained
- [ ] Full database backup created and verified
- [ ] Rollback procedure documented
- [ ] Migration tested in staging
- [ ] Team notified
- [ ] Monitoring configured

**After Running:**
- [ ] Verify migration success
- [ ] Check all profiles have display_role
- [ ] Test RLS policies
- [ ] Monitor performance
- [ ] Document results
- [ ] Commit: `git commit -m "feat: add display_role column to profiles"`

---

## 🎯 QUICK CHECKLIST

**After EVERY prompt execution:**

```bash
# 1. Review changes
git diff

# 2. Type check
npm run type-check

# 3. Run tests
npm test

# 4. Manual test
npm run dev
# Test in browser

# 5. Commit
git add .
git commit -m "feat: [descriptive message]"
git push origin feature/terminology-migration
```

---

## 📞 NEED HELP?

**If stuck on any prompt:**
1. Review the full migration plan: `TERMINOLOGY-MIGRATION-PLAN.md`
2. Check the progress tracker: `MIGRATION-PROGRESS.md`
3. Review pre-flight checklist: `PRE-FLIGHT-CHECKLIST.md`
4. Rollback if needed: `git reset --hard HEAD~1`

---

**Document Version:** 1.0
**Last Updated:** [Date]
**Status:** 📋 READY FOR USE
