# Refer-ify Terminology Migration Plan

**Project Type:** Strategic Controlled Terminology Migration
**Risk Level:** Medium (UI changes) to High (Database changes)
**Estimated Timeline:** 1-2 weeks
**Reversibility:** High (each phase is independently reversible)

---

## 📋 Executive Summary

This document outlines a systematic, phase-based approach to migrating Refer-ify's role terminology from:
- **"Founding Circle"** → **"Founder"** (as a role/member type)
- **"Select Circle"** → **"Referrer"** or **"Member"**
- **"Client"** and **"Candidate"** remain unchanged

The migration uses a **display layer pattern** to decouple user-facing terminology from database schema, ensuring backwards compatibility and safe, reversible changes.

---

## 🎯 Strategic Approach

### Why Display Layer Pattern?

1. **Zero Database Risk**: Keep existing enum values, RLS policies, and migrations intact
2. **Instant Rollback**: Revert UI changes without touching data
3. **Gradual Migration**: Update components independently at your own pace
4. **Testing Safety**: Test display changes without risking data integrity
5. **Future Flexibility**: Easy to change terminology again if needed

---

## 📊 Migration Phases

### Phase 1: Terminology Migration (Safe, Reversible)
**Risk Level:** LOW
**Reversibility:** HIGH

- Analyze impact across codebase
- Create role display mapping layer
- Update UI components to use mapping layer
- **No database changes**

### Phase 2: Application Form Changes (Moderate Risk)
**Risk Level:** MEDIUM
**Reversibility:** HIGH

- Create new referrer application form
- Hide founder application (feature flag approach)
- Add new database tables for referrer applications
- Update marketing CTAs

### Phase 3: Content Updates (Marketing Copy)
**Risk Level:** LOW
**Reversibility:** HIGH

- Update pricing page with new flat-fee model
- Update marketing pages with CEO-provided content
- Add FAQ section
- Create/update story page

### Phase 4: Validation & Testing
**Risk Level:** LOW
**Reversibility:** N/A

- Update test suite for new terminology
- Run comprehensive QA
- Performance testing
- User acceptance testing

### Phase 5: Database Migration (Optional, Future)
**Risk Level:** HIGH
**Reversibility:** MEDIUM

- **Execute ONLY after months of successful UI changes**
- Add display_role column (non-breaking)
- Create bridge migration for gradual transition
- **Do NOT remove old role column yet**

---

## 🔍 PHASE 1: IMPACT ANALYSIS

### Prompt 1: Analyze Impact Scope

**Objective:** Understand the full scope of changes before touching any code.

**Claude Code Prompt:**
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

**Expected Output:**
- Comprehensive file list with occurrence counts
- Risk assessment for each file
- Identification of high-risk areas (database, auth, payments)
- Recommendations for execution order

**Validation Checklist:**
- [ ] All file types searched
- [ ] Risk levels assigned
- [ ] No changes made yet
- [ ] Report saved for reference

---

## 🛠️ PHASE 2: CREATE DISPLAY MAPPING LAYER

### Prompt 2: Create Role Display Mapping Layer

**Objective:** Create abstraction layer to decouple display terminology from database values.

**Claude Code Prompt:**
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

**Implementation Notes:**
- Add unit tests immediately
- Include error handling for unknown roles
- Add deprecation warnings if needed
- Document in code comments

**Validation Checklist:**
- [ ] File created: src/lib/role-display.ts
- [ ] All functions implemented
- [ ] TypeScript types defined
- [ ] JSDoc comments added
- [ ] Unit tests created and passing
- [ ] No TypeScript errors

---

## 🎨 PHASE 3: UPDATE UI COMPONENTS

### Prompt 3: Update UI Components with Display Layer

**Objective:** Systematically update all React components to use the new role display mapping.

**Claude Code Prompt:**
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

**Component Update Strategy:**
1. Start with low-risk components (badges, labels)
2. Move to medium-risk (navigation, dashboard)
3. Finish with high-risk (auth flows, role checks)

**Validation Checklist:**
- [ ] All components updated
- [ ] No database logic changed
- [ ] TypeScript compilation successful
- [ ] No runtime errors in dev environment
- [ ] Role-based conditionals still work
- [ ] Git commit created

---

## 📄 PHASE 4: UPDATE MARKETING CONTENT

### Prompt 4: Update Marketing Pages Content

**Objective:** Implement CEO-provided content updates and new pricing model.

**Claude Code Prompt:**
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

**Content Sources:**
- CEO notes document (to be provided)
- Existing brand guidelines
- Current design system

**Validation Checklist:**
- [ ] Pricing page updated with flat-fee model
- [ ] For companies page created/updated
- [ ] FAQ section added
- [ ] Story page created/updated
- [ ] Mobile responsive testing complete
- [ ] Typography consistent
- [ ] Git commit created

---

## 📝 PHASE 5: REFERRER APPLICATION FORM

### Prompt 5: Referrer Application Form

**Objective:** Create new application form for potential referrers with proper validation and backend integration.

**Claude Code Prompt:**
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

**Implementation Checklist:**
- [ ] Database migration created
- [ ] Migration tested locally
- [ ] Form component created
- [ ] Zod schema defined
- [ ] API route implemented
- [ ] Email notifications configured
- [ ] Success page created
- [ ] Form validation tested
- [ ] Git commit created

---

## 🚫 PHASE 6: HIDE FOUNDER APPLICATION

### Prompt 6: Remove/Hide Founder Application

**Objective:** Hide founder application using feature flags for potential future use.

**Claude Code Prompt:**
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

**Feature Flag Configuration:**
```env
# .env.local
NEXT_PUBLIC_ENABLE_FOUNDER_APPLICATIONS=false
```

**Validation Checklist:**
- [ ] Feature flag added to .env.example
- [ ] All founder application references found
- [ ] Routes conditionally rendered
- [ ] Navigation updated
- [ ] CTAs redirected to referrer application
- [ ] Deprecation notices added
- [ ] No data deleted
- [ ] Git commit created

---

## ✅ PHASE 7: UPDATE TEST SUITE

### Prompt 7: Update Test Suite

**Objective:** Update tests to work with new terminology while maintaining database role integrity.

**Claude Code Prompt:**
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

**Test Coverage Goals:**
- Maintain 96.4%+ coverage
- Add tests for new role-display utility
- Update component snapshot tests
- Validate API contracts unchanged

**Validation Checklist:**
- [ ] role-display.test.ts created
- [ ] All role mapping functions tested
- [ ] Component tests updated
- [ ] Test fixtures updated
- [ ] All tests passing (591/591)
- [ ] Coverage maintained
- [ ] Git commit created

---

## 🗄️ PHASE 8: DATABASE MIGRATION (FUTURE)

### Prompt 8: Database Schema Migration

**⚠️ CRITICAL: Execute ONLY after all UI changes are tested and deployed for several months.**

**Objective:** Create non-breaking database migration to add display role column.

**Claude Code Prompt:**
```
CRITICAL: Only execute this after all UI and business logic changes are tested and deployed.

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

**Pre-Migration Requirements:**
1. All UI changes deployed and stable for 3+ months
2. No user-reported issues with role display
3. Full database backup created
4. Rollback plan documented
5. Staging environment tested
6. Stakeholder approval obtained

**Validation Checklist:**
- [ ] Pre-migration requirements met
- [ ] Database backup created
- [ ] Migration tested in staging
- [ ] Rollback procedure documented
- [ ] RLS policies validated
- [ ] Performance impact assessed
- [ ] Stakeholder approval obtained

---

## 🎯 EXECUTION ORDER

**CRITICAL: Run in this exact sequence. Do not skip ahead.**

| Phase | Prompt | Risk Level | Reversibility | Dependencies |
|-------|--------|------------|---------------|--------------|
| 1 | Impact Analysis | NONE | N/A | None |
| 2 | Mapping Layer | LOW | HIGH | Phase 1 complete |
| 3 | UI Components | LOW | HIGH | Phase 2 complete |
| 4 | Marketing Content | LOW | HIGH | Phase 3 complete |
| 5 | Referrer Form | MEDIUM | HIGH | Phase 4 complete |
| 6 | Hide Founder App | MEDIUM | HIGH | Phase 5 complete |
| 7 | Test Updates | LOW | HIGH | Phases 2-6 complete |
| 8 | Database Migration | HIGH | MEDIUM | All phases + 3 months stability |

---

## ⚠️ SAFETY PROTOCOLS

### After Each Prompt

**Run these validation steps:**

```bash
# 1. Review all changes
git diff

# 2. Check TypeScript compilation
npm run type-check
# or
npx tsc --noEmit

# 3. Run test suite
npm test

# 4. Run linting
npm run lint

# 5. Start development server and manual test
npm run dev
# Open http://localhost:3000
# Test role-based features in browser

# 6. Commit changes incrementally
git add .
git commit -m "feat: [descriptive commit message for this phase]"

# 7. Push to feature branch (not main)
git push origin feature/terminology-migration
```

### Emergency Rollback Procedures

**If something breaks:**

```bash
# Option 1: Revert last commit
git revert HEAD
git push origin feature/terminology-migration

# Option 2: Hard reset to last known good state
git log --oneline  # Find last good commit hash
git reset --hard <commit-hash>
git push --force origin feature/terminology-migration

# Option 3: Abandon feature branch and restart
git checkout main
git branch -D feature/terminology-migration
git checkout -b feature/terminology-migration-v2
```

### Pre-Flight Checklist (Before Each Phase)

- [ ] Current working directory is clean (`git status`)
- [ ] All tests passing (591/591)
- [ ] No TypeScript errors
- [ ] Development server runs without errors
- [ ] Previous phase changes committed
- [ ] Backup created (if touching database)

### Post-Flight Checklist (After Each Phase)

- [ ] Changes reviewed with `git diff`
- [ ] TypeScript compilation successful
- [ ] All tests still passing
- [ ] No console errors in browser
- [ ] Manual testing completed
- [ ] Changes committed with descriptive message
- [ ] Progress tracker updated

---

## 📊 PROGRESS TRACKING

### Migration Status Dashboard

```markdown
## Refer-ify Terminology Migration Progress

**Started:** [Date]
**Target Completion:** [Date]
**Current Phase:** [Phase Number/Name]

### Phase 1: Analysis & Foundation
- [ ] PROMPT 1: Impact analysis complete
- [ ] PROMPT 2: Role mapping layer created
- [ ] Unit tests for mapping layer passing
- [ ] TypeScript compilation successful
- [ ] Phase 1 committed: [commit hash]

### Phase 2: UI Updates
- [ ] PROMPT 3: Components updated
- [ ] No database logic changed (verified)
- [ ] Role-based conditionals still work
- [ ] Manual testing complete
- [ ] Phase 2 committed: [commit hash]

### Phase 3: Marketing Content
- [ ] PROMPT 4: Marketing pages updated
- [ ] Pricing model updated
- [ ] FAQ section added
- [ ] Story page created
- [ ] Mobile responsive verified
- [ ] Phase 3 committed: [commit hash]

### Phase 4: Form Changes
- [ ] PROMPT 5: Referrer form created
- [ ] Database migration run
- [ ] API route implemented
- [ ] Email notifications working
- [ ] PROMPT 6: Founder application hidden
- [ ] Feature flag implemented
- [ ] CTAs redirected
- [ ] Phase 4 committed: [commit hash]

### Phase 5: Validation
- [ ] PROMPT 7: Test suite updated
- [ ] All tests passing: ___/591
- [ ] Coverage maintained: ___%
- [ ] Manual QA checklist complete
- [ ] Stakeholder review complete
- [ ] Phase 5 committed: [commit hash]

### Phase 6: Database (Future - Optional)
- [ ] 3+ months of UI stability achieved
- [ ] PROMPT 8: Migration created
- [ ] Migration tested in staging
- [ ] Stakeholder approval obtained
- [ ] Backup created
- [ ] Rollback plan documented
- [ ] Production deployment complete

### Issues & Blockers
[Document any issues encountered and how they were resolved]

### Lessons Learned
[Document insights for future migrations]
```

---

## 🧪 TESTING STRATEGY

### Component Testing

**Role Display Utility Tests:**
```typescript
// src/__tests__/lib/role-display.test.ts
describe('getRoleDisplay', () => {
  it('maps founding_circle to Founder', () => {
    expect(getRoleDisplay('founding_circle')).toBe('Founder');
  });

  it('maps select_circle to Referrer', () => {
    expect(getRoleDisplay('select_circle')).toBe('Referrer');
  });

  it('keeps client unchanged', () => {
    expect(getRoleDisplay('client')).toBe('Client');
  });

  it('handles unknown roles gracefully', () => {
    expect(() => getRoleDisplay('unknown')).toThrow();
  });
});
```

**Component Integration Tests:**
```typescript
// Example component test update
describe('UserBadge', () => {
  it('displays Founder for founding_circle role', () => {
    const user = { role: 'founding_circle' };
    render(<UserBadge user={user} />);
    expect(screen.getByText('Founder')).toBeInTheDocument();
    // NOT: expect(screen.getByText('Founding Circle'))
  });
});
```

### Manual Testing Checklist

**Role Display Testing:**
- [ ] Dashboard shows correct role badges
- [ ] Navigation menu reflects user role correctly
- [ ] Profile page displays new terminology
- [ ] Job application shows correct role labels
- [ ] Referral tracking uses new role names
- [ ] Admin panel still functions with old role values

**Form Testing:**
- [ ] Referrer application form loads
- [ ] All validations work correctly
- [ ] Form submission successful
- [ ] Email notifications sent
- [ ] Success page displays
- [ ] Founder application is hidden/inaccessible

**Marketing Page Testing:**
- [ ] Pricing page shows flat-fee model
- [ ] For companies page loads correctly
- [ ] FAQ section displays properly
- [ ] Story page is accessible
- [ ] Mobile responsive on all pages
- [ ] All CTAs redirect correctly

### Performance Testing

```bash
# Lighthouse audit
npm run build
npm run start
# Run Lighthouse on key pages

# Bundle size check
npm run build
# Check if bundle size increased significantly
```

---

## 🚨 RISK MITIGATION

### Identified Risks & Mitigation Strategies

| Risk | Severity | Mitigation Strategy |
|------|----------|-------------------|
| Breaking authentication flows | HIGH | Use display layer, don't touch auth logic |
| RLS policies stop working | HIGH | Don't modify database roles or policies |
| Payment processing errors | HIGH | Keep all payment logic using database roles |
| Test suite failures | MEDIUM | Update tests incrementally, maintain coverage |
| User confusion from terminology change | LOW | Clear communication, staged rollout |
| SEO impact from URL changes | LOW | Keep URLs unchanged, update content only |
| Third-party integrations break | MEDIUM | Audit integrations, test webhooks |

### Rollback Triggers

**Immediately rollback if:**
- Authentication stops working
- Users cannot access their accounts
- Payment processing fails
- Critical functionality breaks
- Database corruption occurs
- More than 5 test failures

**Consider rollback if:**
- User complaints increase significantly
- Support tickets spike
- Performance degrades
- SEO rankings drop

---

## 📞 STAKEHOLDER COMMUNICATION

### Pre-Migration Communication

**Email Template:**
```
Subject: Refer-ify Platform Update - Terminology Changes Coming

Hi [Stakeholder],

We're implementing terminology updates across the Refer-ify platform to better reflect our evolved business model:

- "Founding Circle" → "Founder"
- "Select Circle" → "Referrer"

This change:
✅ Improves clarity for new users
✅ Aligns with our current positioning
✅ Has zero impact on functionality
✅ Will be rolled out gradually over [timeframe]

The migration is structured in safe, reversible phases. We'll keep you updated on progress.

Questions? Reply to this email.

Best,
[Your name]
```

### Post-Migration Communication

**Email Template:**
```
Subject: Refer-ify Platform Update - Terminology Migration Complete

Hi [Stakeholder],

Great news! We've successfully completed the terminology migration:

✅ All UI components updated
✅ New referrer application form live
✅ Marketing pages refreshed with new content
✅ All tests passing (591/591)
✅ Zero downtime or user impact

What Changed:
- "Founding Circle" → "Founder"
- "Select Circle" → "Referrer"
- New flat-fee pricing model displayed
- Improved application process

What Stayed The Same:
- All user accounts and data intact
- Authentication and permissions unchanged
- Payment processing unaffected
- Database structure stable

Next Steps:
- Monitor user feedback for 30 days
- Gather metrics on new application forms
- Plan Phase 8 (database migration) for Q[X]

Thank you for your support!

Best,
[Your name]
```

---

## 📚 REFERENCE DOCUMENTATION

### Key Files to Understand

```
refer-ify/
├── src/
│   ├── lib/
│   │   └── role-display.ts          # NEW: Role mapping utilities
│   ├── types/
│   │   └── database.types.ts        # Existing database types
│   ├── components/
│   │   ├── dashboard/               # Role badges, user info
│   │   ├── navigation/              # Role-based menu items
│   │   └── auth/                    # Authentication flows
│   ├── app/
│   │   ├── api/
│   │   │   └── applications/
│   │   │       └── referrer/        # NEW: Referrer application API
│   │   └── (marketing)/
│   │       ├── pricing/             # Updated pricing model
│   │       ├── apply-referrer/      # NEW: Referrer form
│   │       └── story/               # NEW: Company story
│   └── __tests__/
│       └── lib/
│           └── role-display.test.ts # NEW: Mapping layer tests
├── supabase/
│   └── migrations/                  # Database schema
└── .env.local                       # Feature flags
```

### Related Documentation

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Supabase Database Migrations](https://supabase.com/docs/guides/database/migrations)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

## ✅ PRE-FLIGHT CHECKLIST

**Before starting Phase 1, ensure:**

- [ ] Full database backup created
- [ ] Development environment running smoothly
- [ ] All current tests passing (591/591)
- [ ] Git repository is clean (no uncommitted changes)
- [ ] Feature branch created: `feature/terminology-migration`
- [ ] This plan reviewed and approved by stakeholders
- [ ] CEO content document available for Phase 4
- [ ] Email service configured for application notifications
- [ ] Monitoring/alerting configured for production
- [ ] Rollback procedure documented and understood
- [ ] Communication plan ready for users/stakeholders

---

## 🎓 LESSONS LEARNED (Post-Migration)

**To be filled after completion:**

### What Went Well
- [Item 1]
- [Item 2]

### What Could Be Improved
- [Item 1]
- [Item 2]

### Unexpected Challenges
- [Item 1]
- [Item 2]

### Recommendations for Future Migrations
- [Item 1]
- [Item 2]

---

## 📞 SUPPORT & ESCALATION

**Questions or Issues?**

1. **Technical Issues:** [Technical Lead Contact]
2. **Business Questions:** [Product Owner Contact]
3. **Emergency Rollback:** [On-Call Engineer Contact]
4. **Stakeholder Concerns:** [Project Manager Contact]

---

**Document Version:** 1.0
**Last Updated:** [Date]
**Next Review:** After Phase 7 completion

**Status:** 🟡 READY FOR EXECUTION
