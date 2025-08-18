# AI Session Templates for Refer-ify

> **Purpose**: Ready-to-use templates for initializing Claude Code and Cursor sessions with proper context

## 🎯 Claude Code Session Templates

### General Development Session
```markdown
Context Check for Refer-ify Development:

**Platform Overview:**
- Referral-only executive recruitment platform (never job board)
- Current tech: Next.js 15 + React 19 + TypeScript + Supabase
- User roles: Founding Circle → Select Circle → Client → Candidate (no browsing)
- Quality standard: Executive-grade professional experience

**Current Priority:**
- Test coverage enhancement: 43.26% → 80% target
- Reference: .claude-suite/specs/test-coverage-80-percent.md
- Focus areas: API routes ✅, utilities ✅, components 🚧, integration 📋

**Business Rules (Critical):**
1. NO job board features - candidates cannot browse jobs
2. ALL referrals from personal relationships only
3. Role-based access strictly enforced (subscription tiers)
4. Executive-grade UX standards required
5. Financial calculations must be 100% accurate

**Documentation References:**
- Quick rules: CONTEXT_ANCHORS.md
- Core context: .claude-suite/CLAUDE.md
- Workflow: .claude-suite/workflows/feature-development.md

Ready to proceed following documented workflows?
```

### Testing-Focused Session  
```markdown
Test Coverage Enhancement Session - Refer-ify:

**Current Status:**
- Coverage: 43.26% statements, 45.1% lines
- Target: 80% statement coverage
- Strategy: API routes → utilities → components → integration

**Completed Areas:**
✅ Authentication & Authorization (88% coverage)
✅ API Routes (comprehensive coverage for new routes)
✅ Database Utilities (97% coverage - Supabase clients)
✅ Core UI Components (Button, Badge, Dialog, etc.)

**Active Focus:**
🚧 Business Logic Components (ReferralModal, ClientReferralsBoard)
📋 Integration Tests (cross-system workflows)
📋 High-Impact Pages (dashboards, job management)

**Testing Standards:**
- Use Jest + React Testing Library
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies (Supabase, Stripe, etc.)
- Maintain business rule compliance in all tests

Reference: .claude-suite/workflows/testing-strategy.md

Ready to continue coverage enhancement?
```

### API Development Session
```markdown
API Development Session - Refer-ify Backend:

**Platform Context:**
- Referral-only recruitment platform (no job board features)
- Multi-role system with strict access control
- Executive-grade reliability required

**Backend Architecture:**
- Next.js API routes + Supabase (PostgreSQL + Auth + Storage)
- Role-based access control with RLS policies
- Stripe integration for payments and subscriptions
- OpenAI GPT-4 for AI-powered matching

**Business Rules for APIs:**
- Validate user roles before data access
- Enforce subscription tier limitations
- All referrals must be relationship-based
- Financial calculations must be precise
- Use businessRules.ts constants for validation

**Current API Status:**
- Authentication APIs: ✅ Complete with comprehensive tests
- Job management APIs: ✅ Complete with validation
- Payment APIs: ✅ Stripe integration tested
- Referral APIs: 🚧 Enhancement in progress

Reference: ARCHITECTURE.md for system design

Ready to implement robust backend logic?
```

## 🎨 Cursor Session Templates

### UI Development Session
```markdown
UI Development Session - Refer-ify Frontend:

**Platform Identity:**
- Executive recruitment through professional networks
- Premium, sophisticated, trustworthy experience
- Never job board - always referral-based introductions

**Design Standards:**
- Executive-grade professional aesthetics
- Clean, sophisticated, premium feel throughout
- Consistent Tailwind spacing and typography
- Shadcn/ui components with custom enhancements
- Mobile-first responsive design

**Current Tech Stack:**
- Next.js 15 + React 19 + TypeScript (strict mode)
- Tailwind CSS 4.x + Shadcn/ui + Radix UI primitives
- Server Components default, Client Components marked
- Role-based conditional rendering

**Business Rules for UI:**
1. NO "Browse Jobs" or "Apply Now" interfaces for candidates
2. Role-based content visibility (Founding → Select → Client)
3. Professional terminology always (executives, not users)
4. Clear subscription tier value communication
5. Relationship-based referral language throughout

**Current Priorities:**
- Referral submission forms (high-priority UX work)
- Client referral management dashboards
- Real-time status update interfaces
- File upload components for resume handling

**Hand-off to Claude Code:**
Use when you need: API integration, database operations, 
business logic, authentication, or comprehensive testing

Reference: .cursor/instructions.md for detailed guidelines

Ready to build executive-grade interfaces?
```

### Component Development Session
```markdown
Component Development Session - Refer-ify UI:

**Component Development Context:**
- Building for Refer-ify: referral-only executive recruitment
- Target users: Senior executives and hiring decision-makers
- Quality standard: Enterprise SaaS application level

**Technical Requirements:**
- TypeScript with strict typing (no any types)
- Functional components with React hooks
- Proper accessibility (ARIA labels, keyboard navigation)
- Error boundaries and graceful degradation
- Loading states for all async operations

**Business Context for Components:**
- Multi-role system: Founding/Select Circle, Clients, Candidates
- Subscription tiers: Connect ($500), Priority ($1500), Exclusive ($3000)
- All interactions must respect role-based permissions
- Professional language and executive-focused messaging

**Component Patterns:**
```typescript
// Always use proper TypeScript interfaces
interface ComponentProps {
  className?: string;
  // ... specific props
}

// Functional components with proper error handling
export function Component({ className, ...props }: ComponentProps) {
  // Implementation with loading/error states
}
```

**Current Component Priorities:**
1. ReferralSubmissionForm - Core business functionality
2. JobRequirementForm - Client job posting interface  
3. ReferralStatusDashboard - Client referral management
4. NetworkManagement - Founding Circle network tools

Reference: Existing components in src/components/ for patterns

Ready to build professional-grade React components?
```

## 🔄 Session Validation Checkpoints

### Mid-Session Context Check (Use every 3-4 interactions)
```markdown
Quick Compliance Checkpoint:

**Business Rules:**
- ✅/❌ Referral-only model maintained (no job browsing for candidates)
- ✅/❌ Role-based access controls respected
- ✅/❌ Executive-grade quality standards met

**Technical Standards:**
- ✅/❌ TypeScript strict typing used
- ✅/❌ Proper error handling implemented
- ✅/❌ Testing considerations addressed

**Documentation Alignment:**
- ✅/❌ Following [specific workflow/specification]
- ✅/❌ Business rules from businessRules.ts respected
- ✅/❌ Quality gates maintained

**Next Steps Clear:**
- ✅/❌ Current task scope understood
- ✅/❌ Hand-off requirements identified (if applicable)

Continue with current approach?
```

## 🚨 Emergency Context Recovery

### When Session Context is Lost
```markdown
EMERGENCY CONTEXT RECOVERY - Refer-ify:

**Critical Business Rules (Must Remember):**
1. REFERRAL-ONLY PLATFORM - No candidate job browsing ever
2. PERSONAL RELATIONSHIPS ONLY - No cold applications
3. EXECUTIVE-GRADE QUALITY - Professional experience always
4. ROLE-BASED ACCESS - Strict subscription tier enforcement

**Platform Identity:**
- Executive recruitment through trusted professional networks
- "Network = Networth" - warm introductions, not job boards
- Multi-role: Founding Circle (elite) → Select Circle (referrers) → Clients (companies)

**Current Development Context:**
- Tech: Next.js 15 + React 19 + TypeScript + Supabase
- Priority: Test coverage 43% → 80% target
- Quality: Executive-grade UX standards
- Testing: Jest + RTL + Playwright with MSW mocking

**Key Documentation:**
- CONTEXT_ANCHORS.md - Quick reference rules
- .claude-suite/CLAUDE.md - Complete development context
- businessRules.ts - Platform rule enforcement

**Immediate Validation Required:**
What are you about to implement and does it violate any referral-only platform rules?
```

## 📋 Hand-off Templates

### Cursor → Claude Code Hand-off
```markdown
Handing off from Cursor to Claude Code:

**UI Work Completed:**
- Component: [Name and location]
- Functionality: [What the UI does]
- Props interface: [Data structure expected]
- User interactions: [Events that need handling]

**Backend Requirements:**
- API endpoint needed: [Specific route]
- Data operations: [CRUD requirements]
- Business logic: [Calculations, validations, rules]
- Authentication: [Role requirements]

**Context Preservation:**
- Following: [specific documentation/workflow]
- Business rules: [any specific constraints]
- Quality requirements: [testing, error handling needs]

Claude Code: Please implement the backend logic maintaining referral-only platform integrity.
```

### Claude Code → Cursor Hand-off  
```markdown
Handing off from Claude Code to Cursor:

**Backend Implementation Completed:**
- API endpoints: [List of routes implemented]
- Data structure: [Response format]
- Business logic: [Rules implemented]
- Error handling: [Error states to handle in UI]

**UI Requirements:**
- Component needs: [What UI components are needed]
- Data display: [How data should be presented]
- User interactions: [What actions users can take]
- Role-based rendering: [Different views for different roles]

**Context Preservation:**
- Business rules maintained: [Specific rules enforced]
- Quality standards: [Executive-grade requirements]
- Testing: [What needs to be tested in UI]

Cursor: Please build the executive-grade interface for this functionality.
```

---

**Usage Instructions:**
1. Copy appropriate template at session start
2. Customize [bracketed sections] with specific context
3. Use validation checkpoints every 3-4 interactions  
4. Reference CONTEXT_ANCHORS.md for quick rule refreshers
5. Always validate business rule compliance before proceeding

**Last Updated**: January 2025
**Status**: Ready for Production Use