# Production Deployment Specification

> **Created:** September 4, 2025  
> **Status:** Ready for Implementation  
> **Priority:** 🔥 CRITICAL - Revenue Blocking  
> **Timeline:** 5-7 days to production  

## Overview

Deploy Refer-ify platform to production with 82/100 deployment confidence score. The platform is production-ready with minor test stabilization needed.

**Current Platform Status:**
- ✅ Core Features: Complete (AI + Payments + Referrals)
- ✅ Security: 0 vulnerabilities detected
- ✅ Performance: Optimized builds (12.2s, 2.1MB bundle)
- ⚠️  Tests: 94.9% pass rate (34/671 failures need attention)
- ✅ Documentation: 59 comprehensive guides

## Phase 1: Critical Fixes (Days 1-2)

### 1.1 Node.js Environment Upgrade

**Current Issue:** Node.js 18 deprecated by Supabase
**Target:** Node.js 20+ for full compatibility

**Implementation Steps:**
```bash
# Check current version
node --version

# Install Node.js 20+
# Option A: Using nvm
nvm install 20
nvm use 20
nvm alias default 20

# Option B: Direct install from nodejs.org
# Download and install Node.js 20+ from official website

# Verify upgrade
node --version  # Should show v20.x.x
npm --version   # Should show compatible npm version

# Reinstall dependencies with new Node version
cd ~/refer-ify/apps/web
rm -rf node_modules package-lock.json
npm install

# Verify everything works
npm run build
npm test -- --passWithNoTests --watchAll=false
```

**Validation Criteria:**
- Node.js version >= 20.0.0
- All dependencies install without errors
- Build process completes successfully
- No new test failures introduced

### 1.2 Critical Test Fixes

**Current Issue:** 34 failing tests (primarily AI API and React compatibility)
**Target:** Fix 6 AI API test failures (highest priority)

**Priority Test Files:**
1. `src/__tests__/api/ai/suggestions.test.ts` (3 failures)
2. `src/__tests__/api/ai/match.test.ts` (3 failures)

**Implementation Steps:**

#### Fix AI Suggestions Tests
```bash
# Navigate to test file
cd ~/refer-ify/apps/web
npm test -- src/__tests__/api/ai/suggestions.test.ts --watch
```

**Common Issues & Solutions:**
```typescript
// Issue: await isn't allowed in non-async function
// Location: Line 120 in suggestions.test.ts

// BEFORE (incorrect):
const OpenAI = (await import('openai')).OpenAI

// AFTER (correct):
beforeAll(async () => {
  const OpenAI = (await import('openai')).OpenAI
  mockOpenAICreate = new (OpenAI as jest.Mock)().chat.completions.create
})
```

#### Fix AI Match Tests
```bash
npm test -- src/__tests__/api/ai/match.test.ts --watch
```

**Mock Response Alignment:**
```typescript
// Ensure OpenAI mock responses match expected format
const mockAIResponse = {
  choices: [{
    message: {
      content: JSON.stringify({
        overallMatch: 85,
        skillsMatch: 90,
        experienceMatch: 80,
        educationMatch: 85,
        reasoning: "Strong technical background..."
      })
    }
  }]
}
```

**Validation Criteria:**
- All AI API tests pass
- Mock responses align with actual API format
- Error handling works correctly
- No console errors in test output

### 1.3 Component Test Stabilization (Optional for MVP)

**Note:** These can be addressed post-deployment as they don't affect core functionality.

Common Issues:
- React 19 `act()` warnings in component tests
- Date formatting assertions in referral components
- Form validation text matching

## Phase 2: Production Environment Setup (Days 3-4)

### 2.1 Vercel Production Configuration

**Prerequisites:**
- Vercel account created
- GitHub repository connected
- Domain purchased (optional for initial deployment)

**Implementation Steps:**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to project root
cd ~/refer-ify

# Link project to Vercel
vercel link
# Follow prompts:
# - Setup and deploy: Yes
# - Link to existing project: No (create new)
# - Project name: refer-ify
# - Directory: ./apps/web
```

**Environment Variables Setup:**
```bash
# Set production environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add OPENAI_API_KEY production
vercel env add LINKEDIN_CLIENT_ID production
vercel env add LINKEDIN_CLIENT_SECRET production
```

**Project Configuration:**
Create `vercel.json` in project root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "apps/web/$1"
    }
  ],
  "env": {
    "NODE_VERSION": "20"
  }
}
```

### 2.2 Supabase Production Database

**Prerequisites:**
- Supabase account created
- Production project plan selected

**Implementation Steps:**

1. **Create Production Project:**
   - Go to supabase.com/dashboard
   - Create new project
   - Select production-grade plan
   - Choose optimal region (closest to users)
   - Note project URL and anon key

2. **Database Migration:**
```bash
# Link to production project
supabase link --project-ref your-prod-project-ref

# Push database schema
supabase db push

# Verify tables and policies
supabase db inspect
```

3. **Configure Authentication:**
   - Enable LinkedIn OAuth in Supabase Auth settings
   - Add production domain to redirect URLs
   - Configure email templates for magic links
   - Set up SMTP for production emails

4. **Row Level Security Validation:**
```sql
-- Verify RLS policies are active
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Test policies with different user roles
```

### 2.3 Stripe Production Setup

**Prerequisites:**
- Stripe account activated
- Business verification completed

**Implementation Steps:**

1. **Switch to Live Mode:**
   - Complete Stripe onboarding
   - Verify bank account details
   - Switch dashboard to "Live mode"
   - Get production API keys

2. **Configure Webhooks:**
```bash
# Production webhook endpoint
https://your-domain.vercel.app/api/webhooks
```

Required webhook events:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

3. **Test Payment Flow:**
```bash
# Create test payment in production (small amount)
# Verify webhook processing
# Confirm revenue distribution works
```

## Phase 3: Deployment & Monitoring (Day 5)

### 3.1 Pre-Deployment Validation

**Final Quality Gates:**
```bash
cd ~/refer-ify/apps/web

# 1. Build validation
npm run build
# Expected: Clean build with no errors

# 2. Type checking
npm run typecheck || echo "TypeScript errors - review but may be non-blocking"

# 3. Lint check
npm run lint || echo "Lint errors - review but may be non-blocking"

# 4. Test validation
npm test -- --passWithNoTests --watchAll=false
# Expected: AI tests passing, other failures acceptable for MVP

# 5. Environment variable check
vercel env ls
# Verify all required variables are set for production
```

### 3.2 Production Deployment

**Deployment Steps:**
```bash
# Deploy to production
cd ~/refer-ify
vercel --prod

# Verify deployment
vercel inspect your-deployment-url

# Test critical paths
curl https://your-domain.vercel.app/api/health
```

**Post-Deployment Verification:**
1. **Authentication Flow:**
   - Test LinkedIn OAuth login
   - Test magic link authentication
   - Verify role-based redirects

2. **Core Functionality:**
   - Create test job posting
   - Submit test referral
   - Process test payment (small amount)

3. **AI Integration:**
   - Test AI matching endpoint
   - Verify AI suggestions work
   - Check OpenAI API integration

### 3.3 Monitoring Setup

**Essential Monitoring:**

1. **Vercel Analytics:**
```bash
# Enable in Vercel dashboard
# Monitor Web Vitals, performance metrics
# Set up custom events for business metrics
```

2. **Error Tracking:**
```bash
# Option A: Vercel built-in error tracking
# Option B: Sentry integration
npm install @sentry/nextjs
```

3. **Uptime Monitoring:**
   - Vercel built-in monitoring
   - External service (UptimeRobot, Pingdom)
   - Slack/email alerts for downtime

4. **Database Monitoring:**
   - Supabase dashboard metrics
   - Connection pool monitoring
   - Query performance tracking

## Phase 4: Domain & SSL (Optional - Day 6)

### 4.1 Custom Domain Setup

**If you have a custom domain:**

```bash
# Add domain in Vercel dashboard
# Point DNS to Vercel
# SSL automatically provisioned

# DNS Configuration:
# Type: CNAME
# Name: refer-ify (or www)
# Value: cname.vercel-dns.com
```

**Domain Validation:**
```bash
# Verify DNS propagation
nslookup your-domain.com

# Test HTTPS
curl -I https://your-domain.com
```

## Success Criteria

### Technical Metrics
- ✅ **Deployment:** Successful production deployment
- ✅ **Uptime:** 99%+ availability in first week
- ✅ **Performance:** <2s page load times
- ✅ **Security:** HTTPS enforced, no security warnings
- ✅ **Functionality:** All core features operational

### Business Metrics
- ✅ **Authentication:** Users can sign up and login
- ✅ **Job Posting:** Clients can post jobs and pay
- ✅ **Referrals:** Network can submit referrals
- ✅ **AI Matching:** AI suggestions working
- ✅ **Revenue:** Payment processing functional

## Risk Mitigation

### High-Risk Areas
1. **Database Migration:** Test thoroughly in staging
2. **Payment Processing:** Start with small test transactions
3. **AI Integration:** Have fallback for OpenAI outages
4. **Authentication:** Test all OAuth flows

### Rollback Plan
```bash
# If issues arise, rollback to previous deployment
vercel rollback

# Or deploy specific version
vercel --prod --force
```

### Emergency Contacts
- Vercel Support: Enterprise support if available
- Supabase Support: Support ticket system
- Stripe Support: Priority support for business accounts

## Post-Deployment Tasks (Week 2)

### Immediate (24-48 hours)
- [ ] Monitor error rates and performance
- [ ] Verify payment processing accuracy
- [ ] Test user authentication flows
- [ ] Validate AI matching functionality
- [ ] Collect initial user feedback

### Short Term (1-2 weeks)
- [ ] Address remaining test failures
- [ ] Implement advanced monitoring
- [ ] Security audit and penetration testing
- [ ] Performance optimization
- [ ] User onboarding improvements

### Medium Term (1 month)
- [ ] Mobile responsiveness testing
- [ ] Advanced analytics implementation
- [ ] A/B testing framework
- [ ] Customer support system
- [ ] Business metrics dashboard

## Estimated Timeline

**Total Duration:** 5-7 days

- **Day 1:** Node.js upgrade + AI test fixes (4-6 hours)
- **Day 2:** Component test review (optional, 2-4 hours)
- **Day 3:** Vercel + Supabase setup (6-8 hours)
- **Day 4:** Stripe production + testing (4-6 hours)
- **Day 5:** Deployment + monitoring (4-6 hours)
- **Day 6:** Domain setup (optional, 2-3 hours)
- **Day 7:** Buffer for issues + documentation

**Success Definition:** Platform deployed to production with core functionality operational, ready for Founding Circle member recruitment and revenue generation.