# 🎯 Quick Context Anchors for AI Tools

> **Purpose**: Instant reference guide for Claude Code and Cursor to ensure consistent adherence to project standards and business rules.

## 🚨 NEVER DO (Business Rule Violations)

### Platform Integrity Violations
- ❌ Create job browsing features for candidates
- ❌ Allow direct applications without referrals
- ❌ Build public job board functionality
- ❌ Enable candidate self-discovery of opportunities
- ❌ Create "Apply Now" buttons or similar features

### Quality Standard Violations  
- ❌ Compromise executive-grade UX standards
- ❌ Skip comprehensive testing (target: 80% coverage)
- ❌ Use `any` types without justification
- ❌ Deploy without passing all quality gates
- ❌ Create components without proper TypeScript typing

### Security & Access Violations
- ❌ Bypass role-based access control
- ❌ Allow cross-role data access
- ❌ Skip authentication checks in API routes
- ❌ Expose sensitive business logic to unauthorized users

## ✅ ALWAYS DO (Core Requirements)

### Development Process
- ✅ Follow `.claude-suite/workflows/feature-development.md` process
- ✅ Test new features immediately after building
- ✅ Reference existing patterns in codebase before creating new ones
- ✅ Update documentation when making architectural changes

### Code Quality
- ✅ Maintain role-based access control (Founding Circle → Select Circle → Client → Candidate)
- ✅ Use strict TypeScript typing throughout
- ✅ Write comprehensive unit tests for all new code
- ✅ Follow the AAA testing pattern (Arrange, Act, Assert)

### Business Logic
- ✅ All connections must come from personal relationships
- ✅ Maintain subscription tier access controls
- ✅ Ensure executive-grade professional experience in all interfaces
- ✅ Validate financial calculations with 100% accuracy

## 🔄 Current Priority (Updated: January 2025)

### Primary Focus: Test Coverage Enhancement
- **Current Coverage**: 43.26% statements, 45.1% lines
- **Target**: 80% statement coverage
- **Strategy**: API routes → utilities → components → integration
- **Reference**: `.claude-suite/specs/test-coverage-80-percent.md`

### Active Implementation Areas
- 🚧 **Business Logic Components**: ReferralModal, ClientReferralsBoard
- 📋 **Integration Tests**: Cross-system workflow coverage  
- 📋 **High-Impact Pages**: Dashboard, job management, referral workflows

## 🛠️ Tool Selection Guide

### Use Cursor For:
- ✅ UI components and React development
- ✅ Dashboard layouts and user interfaces
- ✅ Component styling with Tailwind CSS
- ✅ Form creation and user interactions
- ✅ Executive-grade UX polish

### Use Claude Code For:
- ✅ API route implementation and testing
- ✅ Database operations and business logic
- ✅ Test coverage improvements
- ✅ Backend authentication and authorization
- ✅ Complex business rule implementation

### Hand-off Triggers
- **"implement API logic"** → Claude Code
- **"add test coverage"** → Claude Code  
- **"build dashboard"** → Cursor
- **"create component"** → Cursor
- **"database operations"** → Claude Code

## 📊 Quality Gates (All Must Pass)

### Before Any Deployment
- [ ] All tests passing (100% pass rate)
- [ ] Test coverage maintained or improved
- [ ] TypeScript compilation with no errors
- [ ] ESLint passing with no errors
- [ ] Business rules compliance verified
- [ ] Executive-grade UX standards met

### Before Code Review
- [ ] Feature follows `.claude-suite/workflows/feature-development.md`
- [ ] Tests written for all new functionality
- [ ] Documentation updated if architectural changes made
- [ ] No business rule violations introduced

## 🏗️ Architecture Quick Reference

### Tech Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS + Shadcn/ui
- **Backend**: Next.js API Routes + Supabase (PostgreSQL + Auth + Storage)
- **Testing**: Jest + React Testing Library + Playwright + MSW
- **Deployment**: Vercel + Supabase Cloud

### User Roles (Strict Hierarchy)
1. **Founding Circle**: Elite executives (access all jobs, manage network)
2. **Select Circle**: Quality referrers (tier-based job access, earn 40% fees)
3. **Client**: Hiring companies (post jobs, receive referrals, pay subscriptions)
4. **Candidate**: Job seekers (NO platform access initially, referral-only)

### Subscription Tiers
- **Connect ($500/month)**: Basic Select Circle access
- **Priority ($1500/month)**: Founding + Select Circle access  
- **Exclusive ($3000/month)**: 24hr exclusive access + concierge

## 📚 Key Documentation References

### Immediate Context
- **Primary**: `.claude-suite/CLAUDE.md` - Core development context
- **Process**: `.claude-suite/workflows/feature-development.md` - Standard workflow
- **Testing**: `.claude-suite/workflows/testing-strategy.md` - Comprehensive testing

### Business Context  
- **Mission**: `.claude-suite/project/mission.md` - Product vision
- **Rules**: Business logic and platform integrity requirements
- **Architecture**: `ARCHITECTURE.md` - Technical system design

### Current Status
- **State**: `PROJECT_STATE.md` - Current development status
- **Coverage**: `.claude-suite/specs/test-coverage-80-percent.md` - Testing specification
- **Integration**: `SYSTEM_INTEGRATION.md` - Tool usage guidelines

## 🎯 Session Initialization Template

**Copy-paste this at the start of any Claude Code or Cursor session:**

```
Context Check for Refer-ify Development:
1. ✅ Referral-only executive recruitment platform (never job board)
2. ✅ Current priority: Test coverage 43% → 80% target
3. ✅ Executive-grade quality standards required
4. ✅ Role-based access: Founding → Select → Client → Candidate
5. ✅ All referrals from personal relationships only

Ready to proceed following documented workflows?
```

## 🔄 Regular Validation Checkpoints

**Use every 3-4 interactions:**

```
Quick compliance check:
- Business rules maintained? (referral-only, no candidate browsing)
- Quality standards met? (executive-grade UX, comprehensive testing)
- Documentation followed? (specific workflow or specification)
- Tool selection appropriate? (UI → Cursor, Backend → Claude Code)
```

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Active - Use for all AI tool interactions