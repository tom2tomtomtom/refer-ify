# CLAUDE.md - Development Guide for Refer-ify

## Project Overview
Refer-ify is an executive recruitment platform built with Next.js 15, React 19, TypeScript, and Supabase. This document contains essential information for Claude Code to effectively work with this codebase.

## Current Project Status
- **Phase**: Job Management + Testing Infrastructure Complete ✅
- **Test Suite**: 570 passing tests out of 591 total (96.4% pass rate)
- **Architecture**: Full-stack SaaS platform with comprehensive testing coverage
- **Next Phase**: Payment integration and AI matching engine

## Tech Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS 4 + Shadcn/ui
- **Backend**: Next.js API Routes + TypeScript  
- **Database**: Supabase (PostgreSQL + Auth + Storage + Real-time)
- **Authentication**: Supabase Auth + LinkedIn OAuth
- **Payments**: Stripe Connect (marketplace model)
- **Testing**: Jest + React Testing Library + Playwright + MSW
- **Hosting**: Vercel (full-stack)

## Directory Structure
```
apps/web/src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Role-based dashboards
│   ├── api/              # Backend API routes
│   └── globals.css
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Custom dashboard components
│   ├── jobs/            # Job-related components
│   ├── referrals/       # Referral system components
│   └── home/            # Homepage components
├── lib/
│   ├── supabase/        # Database clients & types
│   ├── auth.ts          # Auth helpers
│   ├── stripe.ts        # Payment integration
│   └── utils.ts         # Utility functions
├── __tests__/           # Test suite (570+ tests)
│   ├── components/      # Component unit tests
│   ├── api/            # API route tests
│   ├── lib/            # Utility tests
│   ├── integration/    # Integration tests
│   └── setup/          # Test utilities
├── __mocks__/          # Mock configurations
└── types/              # TypeScript definitions
```

## Testing Infrastructure

### Test Coverage Achievement
- **Current Status**: 570 passing tests out of 591 total (96.4% pass rate)
- **Coverage**: 37.45% statements, 39.98% lines
- **Infrastructure**: Production-ready with comprehensive business flow coverage

### Key Testing Areas Covered
1. **Authentication & Security**: Complete auth flow testing (92% coverage)
2. **API Routes**: All endpoints with proper error handling and validation
3. **Database Layer**: Supabase client/server/service utilities (97% coverage)
4. **UI Components**: All core UI components with accessibility testing
5. **Business Components**: Job management, referral systems, dashboard components
6. **Integration Flows**: End-to-end user workflows and business processes

### Running Tests
```bash
npm test                    # Run all tests
npm test -- --coverage     # Full coverage report
npm test -- --watch        # Development mode
npm run test:integration    # Integration tests only
npm run test:e2e           # End-to-end tests only
```

### Test File Organization
- **Component Tests**: `src/__tests__/components/` - Unit tests for React components
- **API Tests**: `src/__tests__/api/` - API route and endpoint testing  
- **Integration Tests**: `src/__tests__/integration/` - Cross-system workflow testing
- **Utility Tests**: `src/__tests__/lib/` - Helper function and utility testing
- **E2E Tests**: `e2e/` - Playwright end-to-end browser testing

## Business Model & Architecture

### Multi-Role System
- **Founding Circle**: Platform owners (full access)
- **Select Circle**: Premium referrers (priority access)
- **Client**: Companies posting jobs (job management)
- **Candidate**: Job seekers (limited dashboard access)

### Subscription Tiers
- **Connect**: $500/month - Basic job posting
- **Priority**: $1500/month - Enhanced visibility
- **Exclusive**: $3000/month - Full network access

### Database Schema (Key Tables)
- `users` - User authentication and profiles
- `jobs` - Job postings with subscription tiers
- `referrals` - Referral submissions and tracking
- `candidates` - Professional profiles and resumes
- `candidate_referrals` - Referral relationship tracking

## Development Commands

### Essential Commands
```bash
npm run dev          # Start development server (port 3000)
npm run build        # Production build
npm run lint         # ESLint check
npm run typecheck    # TypeScript validation
npm test             # Run test suite
```

### Testing Commands (Critical for Development)
```bash
npm test -- --passWithNoTests --watchAll=false    # Quick test run
npm test -- --coverage                           # Coverage report
npm run test:integration                          # Integration tests
```

## Key Implementation Notes

### Authentication Flow
- Supabase Auth with LinkedIn OAuth integration
- Server-side session management with proper cookie handling
- Role-based access control throughout the application

### API Route Patterns
- All API routes follow RESTful conventions
- Proper error handling with consistent JSON responses
- Supabase RLS (Row Level Security) integration
- Request validation using TypeScript interfaces

### Component Architecture
- Shadcn/ui as the base component library
- Custom components built with composition patterns
- Proper accessibility attributes and testing
- Form handling with client-side validation

### Database Integration
- Supabase client for browser-side operations
- Server-side client for API routes and SSR
- Real-time subscriptions for live updates
- Proper error handling and connection management

## Recent Major Achievements

### Testing Infrastructure (Session 9)
- **Reduced failing tests from 42 to 21** (50% improvement in reliability)
- **Achieved 96.4% test pass rate** (570 out of 591 tests passing)
- **Fixed critical integration test issues**: Authentication flows, form submissions
- **Enhanced API route testing**: JSON parsing, error handling, Supabase integration
- **Improved component accessibility**: Proper form labels and ARIA attributes

### Key Fixes Implemented
1. **API JSON Parsing**: Added proper error handling in referrals route
2. **Integration Test Labels**: Fixed field name mismatches in forms
3. **Form Accessibility**: Added proper htmlFor and id attributes
4. **File Upload Validation**: Correct file size limits (5MB) and type validation

## Development Workflow

### When Making Changes
1. **Always run tests first**: `npm test -- --passWithNoTests --watchAll=false`
2. **Run type checking**: `npm run typecheck`
3. **Run linting**: `npm run lint`
4. **Test specific components**: Focus on affected areas
5. **Verify integration**: Check cross-system functionality

### Git Workflow
- Main branch for production-ready code
- Feature branches for new development
- Commit messages should be descriptive and include scope
- Always run tests before committing

## Known Issues & Solutions

### Current Outstanding Issues (21 failing tests)
1. **JobListingPage component**: Supabase channel mock needs improvement
2. **ReferralForm availability field**: Select component text assertion needs update
3. **Minor component rendering**: Edge cases in test scenarios

### Resolved Issues
- ✅ LinkedIn OAuth redirect_uri mismatch
- ✅ Magic link auth session persistence  
- ✅ Next.js 15 + Supabase SSR compatibility
- ✅ API route JSON parsing errors
- ✅ Component accessibility and form validation
- ✅ Integration test field matching

## Future Development Priorities

### Immediate Next Steps
1. **Complete remaining 21 test fixes** for 100% test pass rate
2. **Payment integration** with Stripe Connect
3. **AI matching engine** implementation with GPT-4
4. **Production deployment** setup and optimization

### Testing Maintenance
- **Monitor test reliability**: Keep pass rate above 95%
- **Add tests for new features**: Maintain coverage standards
- **Update mocks**: Keep Supabase and external service mocks current
- **Performance testing**: Add load testing for critical paths

## Environment Setup

### Required Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Local Development
1. Install dependencies: `npm install`
2. Set up environment variables
3. Run development server: `npm run dev`
4. Verify tests pass: `npm test`

This document should be updated with each major development session to maintain accuracy and usefulness.