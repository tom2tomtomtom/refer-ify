# CLAUDE.md - Development Context

> Critical information for Claude Code assistant

## 🎯 Product Overview

**Refer-ify** is a premium referral-based executive recruitment platform built on Next.js 15 + Supabase. 

**Core Philosophy**: "Network = Networth" - All connections happen through warm introductions, not cold applications.

**NOT a Job Board**: Candidates cannot browse or apply. All referrals come from personal relationships.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15.4.6 + React 19.1.0 + TypeScript
- **Backend**: Next.js API Routes + Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS 4.x + Shadcn/ui + Radix UI
- **Testing**: Jest + React Testing Library + Playwright + MSW
- **Deployment**: Vercel + Supabase Cloud

### Key Dependencies
```json
{
  "next": "15.4.6",
  "react": "19.1.0", 
  "typescript": "^5",
  "tailwindcss": "^4",
  "@supabase/supabase-js": "^2",
  "@stripe/stripe-js": "^4",
  "openai": "^4"
}
```

## 🔐 User Roles & Permissions

### Founding Circle (Elite Network Leaders)
- **Access**: ALL job requirements regardless of tier
- **Network**: Can invite up to 40 Select Circle members
- **Earnings**: 40% direct referrals + 15% from their network
- **Management**: Oversee their Select Circle performance

### Select Circle (Quality Referrers) 
- **Access**: Connect + Priority tier jobs (no Exclusive)
- **Referrals**: Earn 40% for successful placements
- **Limit**: 40 members per Founding Circle member

### Clients (Revenue Source)
- **Subscriptions**: Connect ($500), Priority ($1500), Exclusive ($3000)
- **Access**: Post private job requirements to network
- **Receive**: Curated referrals based on subscription tier

### Candidates (No Platform Access Initially)
- **Interaction**: Only when being referred for specific roles
- **No Browsing**: Cannot view jobs or apply directly

## 💰 Revenue Model

### Fee Structure
- **Platform**: Keeps 45% of placement fees
- **Select Circle**: 40% of placement fees
- **Founding Circle**: 15% from their network + 40% direct

### Subscription Tiers
- **Connect ($500/month)**: Basic access to Select Circle
- **Priority ($1500/month)**: Access to Founding + Select Circle
- **Exclusive ($3000/month)**: 24hr exclusive access + concierge

## 🚀 Development Status (80% Complete)

### ✅ COMPLETED (Phase 0)
- Next.js 15 + Supabase foundation
- Multi-role authentication (LinkedIn OAuth + Email)
- Database schema + RLS policies
- Role-based dashboard system
- Job management system with real-time feed
- Professional UI/UX with Shadcn/ui
- Comprehensive testing infrastructure (Jest + Playwright + MSW)
- CI/CD pipeline

### 🚧 CURRENT FOCUS
**Week 3 - Founding + Candidate Systems**
- [x] Founding Circle dashboards (network, revenue with charts, invite, advisory)
- [x] Candidate referral form (resume upload + storage, duplicate checks)
- [x] Candidate tables (candidates, candidate_referrals) and role-aware `/candidates` dashboard
- [ ] My Referrals dashboards for Founding/Select
- [ ] Client-side candidate review tools (status updates, feedback)

### 📋 UPCOMING
- AI matching engine (GPT-4 + vector embeddings)
- Payment processing (Stripe subscriptions + fee distribution)  
- Analytics & optimization dashboards
- Production launch preparation

## 🧪 Testing & Coverage

### Test Commands
```bash
# Development Testing
npm test                    # Run all tests
npm test -- --watch        # Jest in watch mode
npm test -- --coverage     # Run with coverage report

# Coverage Analysis
npm test -- --coverage --passWithNoTests  # Full coverage check
npm test -- --coverage --silent          # Coverage summary only

# Quality Gates
npm run test:ci      # All unit/integration tests
npm run test:e2e     # E2E tests headless
npm run test:all     # Complete test suite
npm run build        # Production build
npm run type-check   # TypeScript validation
npm run lint         # ESLint check
```

### Coverage Progress & Targets
- **Current Coverage**: 43.26% statements, 45.1% lines (as of January 2025)
- **Target**: 80% statement coverage
- **Progress**: +18% improvement from 25% baseline
- **Strategy**: API routes → utilities → components → integration tests

### Test Categories & Status
- ✅ **Authentication & Authorization**: Complete (auth.ts, role-based access)
- ✅ **API Routes**: Comprehensive (users, payments, storage, webhooks, dev tools)
- ✅ **Database Utilities**: Full coverage (Supabase client/server/service)
- ✅ **Core Components**: JobCard, ReferralForm, dialogs, UI components
- ✅ **Utility Functions**: utils.ts, stripe.ts integration
- 🚧 **Business Logic Components**: In progress (ReferralModal, ClientReferralsBoard)
- 🚧 **Integration Tests**: Targeted workflow coverage
- 📋 **E2E Tests**: Critical user flow coverage

### Test Architecture
```bash
src/__tests__/
├── api/                    # API route tests (auth, jobs, referrals, etc.)
├── components/             # Component unit tests
│   ├── ui/                # UI component tests (button, dialog, etc.)
│   ├── jobs/              # Job-related component tests
│   └── referrals/         # Referral component tests
├── lib/                   # Utility and service tests
│   ├── supabase/          # Database client tests
│   └── stripe.test.ts     # Payment integration tests
├── integration/           # Cross-system integration tests
└── setup/                 # Test configuration and utilities
```

## 🔧 Development Guidelines

### Code Quality Standards
- **TypeScript**: Strict typing, no `any` without justification
- **React**: Functional components, custom hooks, error boundaries
- **Next.js**: Server components default, client components marked
- **Testing**: Test new features as you build, maintain 80% coverage target

### Testing Workflow Integration
- **New Features**: Write comprehensive tests immediately after implementation
- **Coverage Sprints**: Regular dedicated sessions to increase legacy coverage
- **Parallel Development**: Build features while maintaining testing discipline
- **Quality Gates**: All tests must pass before deployment

### Business Logic Rules
- **Referral-Only**: Never allow direct candidate browsing/application
- **Role-Based Access**: Subscription tiers strictly enforced
- **Executive Experience**: Professional, polished UI/UX always
- **Financial Accuracy**: Payment calculations must be 100% correct

### Security Requirements
- **Authentication**: JWT + OAuth with proper session management
- **Authorization**: RLS policies + role-based API protection
- **Data Protection**: Input validation, SQL injection prevention
- **Privacy**: GDPR compliance, data retention policies

## 🎯 Key Success Metrics

- **Network Quality**: Successful placement rate per referral
- **Client Satisfaction**: Subscription retention and tier upgrades
- **Network Earnings**: Average income per referrer
- **Platform Growth**: Monthly recurring revenue from subscriptions

## 🚨 Critical Reminders

1. **Never Create Job Board Features**: No candidate browsing or self-application
2. **Maintain Role Boundaries**: Strict subscription tier access control
3. **Executive Standards**: Professional experience in all interactions
4. **Test Everything**: Comprehensive testing before any deployment
5. **Financial Precision**: Payment logic must be bulletproof

## 📁 Project Structure

```
refer-ify/
├── apps/web/                 # Next.js application
│   ├── src/app/             # App router pages
│   ├── src/components/      # Reusable components
│   ├── src/lib/            # Utilities and configurations
│   └── __tests__/          # Test files
├── .claude-suite/          # Claude development context
│   ├── project/           # Product documentation
│   ├── workflows/         # Development workflows
│   ├── error-handling.md  # Error handling patterns
│   └── validation-checklists.md  # Quality checklists
└── PROJECT_STATE.md       # Current development status
```

## 🔗 Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration  
STRIPE_SECRET_KEY=sk_test_or_live_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_or_live_key

# OpenAI Integration
OPENAI_API_KEY=your_openai_key
```

## 🤖 AI Tool Integration

### Context Loading for All AI Tools
- **Quick Start**: Use `CONTEXT_ANCHORS.md` for immediate context
- **Session Templates**: Use `.claude-suite/session-templates.md` for proper initialization
- **Validation**: Use `.claude-suite/validation-prompt.md` to ensure rule compliance
- **Business Rules**: Always reference `src/lib/constants/businessRules.ts` for platform rules

### Automated Compliance
- **Pre-commit Hooks**: `.husky/pre-commit` prevents business rule violations
- **Cursor Guidelines**: `.cursor/instructions.md` provides Cursor-specific context
- **Rule Enforcement**: TypeScript constants prevent accidental rule violations

## 📞 Support Commands

When user needs help:
- `/help`: Get help with using Claude Code
- **Feedback**: Report issues at https://github.com/anthropics/claude-code/issues

---

**Last Updated**: August 18, 2025  
**Version**: Phase 1 - Referral System Implementation  
**Status**: MVP Development (80% Complete)