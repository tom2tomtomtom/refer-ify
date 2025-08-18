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

### 🚧 CURRENT FOCUS (Phase 1)
**Week 3 - Referral System Implementation**
- [ ] Referral submission form with file upload
- [ ] Referral management dashboard for clients
- [ ] My Referrals dashboard for network members
- [ ] Notification system for status updates

### 📋 UPCOMING (Phases 2-5)
- AI matching engine (GPT-4 + vector embeddings)
- Payment processing (Stripe subscriptions + fee distribution)  
- Analytics & optimization dashboards
- Production launch preparation

## 🧪 Testing Infrastructure

### Commands
```bash
# Development
npm run dev          # Next.js with Turbopack
npm run test:watch   # Jest in watch mode
npm run test:e2e:ui  # Playwright with UI

# Quality Gates
npm run test:ci      # All unit/integration tests
npm run test:e2e     # E2E tests headless
npm run test:all     # Complete test suite
npm run build        # Production build
npm run type-check   # TypeScript validation
npm run lint         # ESLint check
```

### Coverage Requirements
- **Unit Tests**: 80-90% coverage for new code
- **Integration Tests**: All API routes tested
- **E2E Tests**: Critical user flows covered

## 🔧 Development Guidelines

### Code Quality Standards
- **TypeScript**: Strict typing, no `any` without justification
- **React**: Functional components, custom hooks, error boundaries
- **Next.js**: Server components default, client components marked
- **Testing**: Write tests first, comprehensive coverage

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

## 📞 Support Commands

When user needs help:
- `/help`: Get help with using Claude Code
- **Feedback**: Report issues at https://github.com/anthropics/claude-code/issues

---

**Last Updated**: August 18, 2025  
**Version**: Phase 1 - Referral System Implementation  
**Status**: MVP Development (80% Complete)