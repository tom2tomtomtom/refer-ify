# Pre-Flight Checklist - Terminology Migration

**Purpose:** Ensure system is ready before starting each migration phase
**Review Date:** [Date]
**Reviewed By:** [Name]

---

## 🎯 BEFORE STARTING PHASE 1

### Environment Setup
- [ ] Development environment running smoothly
- [ ] Node.js and npm versions correct
  ```bash
  node --version  # Expected: [version]
  npm --version   # Expected: [version]
  ```
- [ ] All dependencies installed
  ```bash
  npm install
  ```
- [ ] Environment variables configured
  - [ ] `.env.local` exists and is properly configured
  - [ ] Database connection string valid
  - [ ] Email service credentials configured

### Repository Status
- [ ] Git repository is clean (no uncommitted changes)
  ```bash
  git status
  # Should show: "working tree clean"
  ```
- [ ] On correct branch (or create feature branch)
  ```bash
  git checkout -b feature/terminology-migration
  ```
- [ ] Remote repository accessible
  ```bash
  git fetch origin
  ```
- [ ] Latest changes pulled from main
  ```bash
  git pull origin main
  ```

### Code Quality Baseline
- [ ] All tests passing
  ```bash
  npm test
  # Expected: All tests passing (591/591)
  ```
- [ ] Test coverage at baseline
  ```bash
  npm test -- --coverage
  # Expected: 96.4% or higher
  ```
- [ ] TypeScript compilation successful
  ```bash
  npm run type-check
  # or
  npx tsc --noEmit
  # Expected: No errors
  ```
- [ ] Linting passes
  ```bash
  npm run lint
  # Expected: No errors
  ```
- [ ] Development server starts without errors
  ```bash
  npm run dev
  # Expected: Compiles successfully
  ```

### Database Status
- [ ] Database connection working
- [ ] All migrations applied
  ```bash
  # Check Supabase dashboard or run migration status command
  ```
- [ ] Database backup created
  ```bash
  # Create backup before any database changes
  ```
- [ ] Test data available (if needed)

### Documentation Ready
- [ ] Migration plan reviewed (`TERMINOLOGY-MIGRATION-PLAN.md`)
- [ ] Progress tracker ready (`MIGRATION-PROGRESS.md`)
- [ ] CEO content document available (for Phase 4)
- [ ] Stakeholder communication prepared

### Team Readiness
- [ ] Stakeholders informed of migration start
- [ ] Team members aware of changes
- [ ] Emergency contacts documented
- [ ] Rollback plan understood by team

---

## 🎯 BEFORE EACH PHASE

### Pre-Phase Checklist (Run before Phase 2, 3, 4, 5)

- [ ] Previous phase completed successfully
- [ ] Previous phase changes committed
  ```bash
  git log --oneline -1
  # Verify last commit is from previous phase
  ```
- [ ] All tests still passing
  ```bash
  npm test
  ```
- [ ] No TypeScript errors
  ```bash
  npm run type-check
  ```
- [ ] Development server runs without errors
  ```bash
  npm run dev
  ```
- [ ] Progress tracker updated from previous phase
- [ ] Any issues from previous phase resolved
- [ ] Working directory is clean
  ```bash
  git status
  ```

---

## 🎯 PHASE 1 SPECIFIC CHECKLIST

### Before Impact Analysis (Prompt 1)
- [ ] Search tools available (grep, rg, or IDE search)
- [ ] Ready to document findings
- [ ] No changes will be made (analysis only)

### Before Creating Mapping Layer (Prompt 2)
- [ ] Impact analysis complete and reviewed
- [ ] Understand all places terminology is used
- [ ] Ready to create new file: `src/lib/role-display.ts`

---

## 🎯 PHASE 2 SPECIFIC CHECKLIST

### Before Updating UI Components (Prompt 3)
- [ ] Role mapping layer created and tested
- [ ] Mapping layer tests passing
- [ ] List of components to update identified
- [ ] Ready to modify components systematically

---

## 🎯 PHASE 3 SPECIFIC CHECKLIST

### Before Marketing Content Updates (Prompt 4)
- [ ] CEO content document ready
- [ ] New pricing tiers documented:
  - [ ] $100-150K = $15,000
  - [ ] $150-200K = $20,000
  - [ ] $200-300K = $30,000
  - [ ] $300-400K = $39,000
  - [ ] $400K+ = $45,000
- [ ] Platform fees documented:
  - [ ] Start Up/Small Business: $500/month
  - [ ] Mid-Sized Business: $1,500/month
  - [ ] Enterprise Business: $3,000/month
- [ ] FAQ content ready
- [ ] Story page content ready
- [ ] Design system documentation accessible

---

## 🎯 PHASE 4 SPECIFIC CHECKLIST

### Before Creating Referrer Form (Prompt 5)
- [ ] Database migration process understood
- [ ] Email service configured and tested
- [ ] All 13 form fields documented
- [ ] Zod validation library available
- [ ] React Hook Form installed
- [ ] shadcn/ui Form components available

### Before Hiding Founder Application (Prompt 6)
- [ ] Feature flag approach understood
- [ ] `.env.example` file located
- [ ] Aware of all founder application references
- [ ] Deprecation notice template ready

---

## 🎯 PHASE 5 SPECIFIC CHECKLIST

### Before Test Updates (Prompt 7)
- [ ] All previous phase changes deployed
- [ ] Baseline test count known (591)
- [ ] Baseline coverage known (96.4%)
- [ ] Test framework understood (Jest/Vitest)
- [ ] Ready to create new test file
- [ ] Ready to update existing tests

---

## 🎯 PHASE 6 SPECIFIC CHECKLIST (FUTURE - DO LAST)

### Before Database Migration (Prompt 8)

**⚠️ CRITICAL: Only proceed if ALL of these are true:**

- [ ] **3+ months** have passed since Phase 5 completion
- [ ] UI changes have been stable (no role display issues)
- [ ] Zero critical bugs related to role display
- [ ] All stakeholders approve database migration
- [ ] Full database backup created (verified restorable)
- [ ] Rollback plan documented and tested
- [ ] Migration tested in staging environment
- [ ] RLS policies reviewed and understood
- [ ] Performance impact assessed
- [ ] Team notified of migration window
- [ ] Monitoring and alerting configured
- [ ] Downtime window scheduled (if needed)

**DO NOT proceed with Phase 6 unless ALL boxes are checked.**

---

## 🔒 SAFETY CHECKS

### After Each Prompt Execution

**Immediately run these checks:**

```bash
# 1. Review changes
git diff

# 2. Check file modifications
git status

# 3. Run TypeScript check
npm run type-check

# 4. Run linting
npm run lint

# 5. Run tests
npm test

# 6. Check test coverage (if modified tests)
npm test -- --coverage

# 7. Start dev server and manual test
npm run dev
# Open http://localhost:3000
# Test key functionality
```

### Manual Testing Checklist (After Each Phase)

- [ ] User login works
- [ ] User registration works
- [ ] Dashboard loads correctly
- [ ] Navigation shows correct items for user role
- [ ] Role badges display correctly
- [ ] Job posting works
- [ ] Job application works
- [ ] Referral submission works
- [ ] Payment processing works (if applicable)
- [ ] Forms submit correctly
- [ ] Email notifications sent (if applicable)
- [ ] No console errors in browser
- [ ] No console warnings (or known/acceptable warnings only)

### Commit Checklist

- [ ] Changes reviewed with `git diff`
- [ ] Commit message is descriptive
- [ ] Commit message follows format: `feat: [description]` or `fix: [description]`
- [ ] No unintended files included
- [ ] No sensitive data committed (API keys, passwords)
- [ ] Commit created successfully
  ```bash
  git add .
  git commit -m "feat: [descriptive message]"
  ```
- [ ] Pushed to feature branch
  ```bash
  git push origin feature/terminology-migration
  ```

---

## 🚨 EMERGENCY PROCEDURES

### If Tests Fail

1. **Don't panic** - Review the error messages
2. **Identify cause** - Which tests failed and why?
3. **Options:**
   - Fix the issue if it's a simple fix
   - Rollback changes: `git reset --hard HEAD~1`
   - Ask for help if needed

### If TypeScript Errors Occur

1. **Read the error** - TypeScript errors are usually informative
2. **Check recent changes** - What files were just modified?
3. **Options:**
   - Fix type mismatches
   - Add proper types
   - Rollback: `git reset --hard HEAD~1`

### If Development Server Won't Start

1. **Check terminal output** - Look for error messages
2. **Common causes:**
   - Syntax errors in code
   - Missing dependencies
   - Port already in use
3. **Quick fixes:**
   ```bash
   # Kill process on port
   lsof -ti:3000 | xargs kill

   # Reinstall dependencies
   rm -rf node_modules
   npm install

   # Rollback changes
   git reset --hard HEAD~1
   ```

### If Database Issues Occur

1. **STOP immediately** - Don't make more changes
2. **Check database backup** - Ensure backup exists
3. **Review migration** - Was it applied correctly?
4. **Rollback options:**
   - Revert migration in Supabase dashboard
   - Restore from backup
   - Contact database admin

### Emergency Rollback

**If anything breaks critically:**

```bash
# Option 1: Revert last commit
git revert HEAD
git push origin feature/terminology-migration

# Option 2: Hard reset (use with caution)
git log --oneline
# Find last good commit hash
git reset --hard <commit-hash>
git push --force origin feature/terminology-migration

# Option 3: Abandon feature branch
git checkout main
git branch -D feature/terminology-migration
# Restart from clean state
```

---

## 📋 SIGN-OFF

### Before Starting Migration

**I confirm that:**
- [ ] I have reviewed the complete migration plan
- [ ] I understand the risks and mitigation strategies
- [ ] I know how to rollback changes if needed
- [ ] I have completed all items in this checklist
- [ ] I have stakeholder approval to proceed
- [ ] I am ready to begin Phase 1

**Signature:** ___________________________
**Date:** ___________________________

---

## 📞 EMERGENCY CONTACTS

**If you need help during migration:**

- **Technical Issues:** [Name/Contact]
- **Database Issues:** [Name/Contact]
- **Business Decisions:** [Name/Contact]
- **Emergency Rollback:** [Name/Contact]

---

## 🔄 POST-MIGRATION CHECKLIST

### After Completing All Phases (Before Production)

- [ ] All phases completed successfully
- [ ] All tests passing (591+ tests)
- [ ] Code coverage maintained (96.4%+)
- [ ] Manual QA checklist completed
- [ ] Performance testing done
- [ ] Security review completed (if needed)
- [ ] Stakeholder approval obtained
- [ ] Documentation updated
- [ ] User communication prepared
- [ ] Monitoring configured
- [ ] Rollback plan tested
- [ ] Production deployment scheduled
- [ ] Team briefed on changes

---

**Checklist Version:** 1.0
**Last Updated:** [Date]
**Next Review:** Before each phase

**Status:** ✅ READY FOR USE
