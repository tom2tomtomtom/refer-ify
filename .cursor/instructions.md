# Cursor Development Guidelines for Refer-ify

> **Purpose**: Specific instructions for Cursor AI to follow when developing the Refer-ify platform

## 🎯 Core Business Rules (NEVER VIOLATE)

### Platform Integrity (Critical)
- **NO job board features** - candidates cannot browse jobs or opportunities
- **NO direct applications** - all connections must come through referrals only
- **NO candidate self-service** - candidates have no platform access initially
- **Referral-only model** - all job discovery happens through network relationships

### User Role Hierarchy (Strict)
1. **Founding Circle**: Elite executives (access all jobs, manage networks)
2. **Select Circle**: Quality referrers (tier-based access, earn 40% referral fees)  
3. **Client**: Companies (post requirements, receive referrals, pay subscriptions)
4. **Candidate**: Professionals (no browsing access, referral participation only)

### Quality Standards (Non-negotiable)
- **Executive-grade UX**: Professional, polished interface at all times
- **Role-based access control**: Users only see content appropriate to their tier
- **Financial accuracy**: All fee calculations must be 100% correct
- **Security first**: Proper authentication and authorization always

## 🏗️ Technical Architecture

### Current Tech Stack
```typescript
Frontend Stack:
- Next.js 15.4.6 (App Router)
- React 19.1.0 (Server Components default)
- TypeScript (strict mode)
- Tailwind CSS 4.x + Shadcn/ui components
- Radix UI primitives

Backend Integration:
- Next.js API Routes
- Supabase (PostgreSQL + Auth + Storage + Real-time)
- Stripe for payments
- OpenAI GPT-4 for AI features

Testing & Quality:
- Jest + React Testing Library (target: 80% coverage)
- Playwright for E2E testing
- MSW for API mocking
- ESLint + TypeScript strict mode
```

### File Structure Patterns
```
src/
├── app/
│   ├── (auth)/              # Authentication flows
│   ├── (dashboard)/         # Role-based dashboards
│   ├── api/                 # Backend API routes
│   └── globals.css
├── components/
│   ├── ui/                  # Shadcn/ui components
│   ├── jobs/               # Job management components
│   ├── referrals/          # Referral system components
│   └── navigation/         # Navigation components
└── lib/
    ├── supabase/           # Database clients
    ├── auth.ts             # Authentication utilities
    ├── stripe.ts           # Payment integration
    └── utils.ts            # General utilities
```

## 🎨 UI Development Guidelines

### Design Standards
- **Executive Professional**: Clean, sophisticated, premium feel
- **Consistent Spacing**: Use Tailwind spacing scale consistently
- **Typography**: Clear hierarchy, readable fonts, professional tone
- **Color Palette**: Professional blues, grays, with accent colors for actions
- **Responsive Design**: Mobile-first approach, works on all devices

### Component Patterns
```typescript
// Always use TypeScript with proper typing
interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  // ... other specific props
}

// Functional components with hooks
export function ComponentName({ className, children, ...props }: ComponentProps) {
  // Component logic here
  return (
    <div className={cn("base-styles", className)} {...props}>
      {children}
    </div>
  );
}

// Export with proper display name for debugging
ComponentName.displayName = "ComponentName";
```

### Shadcn/ui Integration
- Use existing Shadcn/ui components when possible
- Extend components with additional variants if needed
- Follow the established design tokens and patterns
- Maintain consistency with existing component library

## 🔐 Authentication & Authorization

### Role-Based Access Patterns
```typescript
// Always check user role before rendering role-specific content
const { user, profile } = await getCurrentUser();

// Use role-based conditionals
if (profile.role === 'founding_circle') {
  // Show Founding Circle specific content
} else if (profile.role === 'select_circle') {
  // Show Select Circle appropriate content
}

// Protect routes with proper role checks
if (!hasAccess(profile.role, requiredRole)) {
  redirect('/unauthorized');
}
```

### Authentication Patterns
```typescript
// Always handle loading and error states
function ProtectedComponent() {
  const { user, loading, error } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) redirect('/login');
  
  return <ActualComponent user={user} />;
}
```

## 📱 Feature Development Workflow

### Before Starting Any Feature
1. Check `CONTEXT_ANCHORS.md` for current priorities
2. Review existing patterns in similar components
3. Understand the business rules for this feature area
4. Plan component hierarchy and data flow

### Component Development Process
1. **Create TypeScript interfaces** for all props and data structures
2. **Build component structure** with proper accessibility
3. **Add interactive behavior** with proper state management
4. **Style with Tailwind CSS** following design system
5. **Test component functionality** (add to testing backlog if complex)

### Form Development (Critical for Referrals)
```typescript
// Always use proper form validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define validation schema
const formSchema = z.object({
  candidateName: z.string().min(2, 'Name must be at least 2 characters'),
  candidateEmail: z.string().email('Invalid email address'),
  // ... other fields
});

// Use in component
function ReferralForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // ... default values
    }
  });
  
  // Handle form submission with proper error handling
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await submitReferral(values);
      // Success handling
    } catch (error) {
      // Error handling
    }
  }
}
```

## 🔄 When to Hand-off to Claude Code

### Trigger Phrases for Claude Code
- **"implement API logic"** - Backend functionality needed
- **"database operations"** - Supabase integration required
- **"business logic"** - Complex calculations or rules
- **"authentication setup"** - Auth flow implementation
- **"test coverage"** - Adding comprehensive tests
- **"backend integration"** - Server-side functionality

### Hand-off Context Template
```markdown
Handing off to Claude Code for: [specific task]

Current UI state:
- Component: [component name and location]
- Props needed: [list of props/data the component expects]
- User interactions: [what the UI needs to do]

Backend requirements:
- API endpoint: [what endpoint is needed]
- Data structure: [what data format is expected]
- Business rules: [any specific business logic]

Context: Following [specific documentation file] workflow
```

## 📋 Code Quality Checklist

### Before Committing Code
- [ ] **TypeScript**: No type errors, strict typing used
- [ ] **ESLint**: No linting errors or warnings  
- [ ] **Accessibility**: Proper ARIA labels and keyboard navigation
- [ ] **Responsive**: Works on mobile, tablet, desktop
- [ ] **Business Rules**: No violations of referral-only platform rules
- [ ] **Role Access**: Component respects user role permissions

### Component Quality Standards
- [ ] **Props Interface**: Proper TypeScript interface defined
- [ ] **Error Boundaries**: Graceful error handling
- [ ] **Loading States**: Proper loading indicators where needed
- [ ] **Empty States**: Meaningful messages when no data
- [ ] **Responsive Design**: Mobile-first responsive behavior

## 🎯 Current Development Priorities

### Phase: Test Coverage Enhancement (Active)
- **Goal**: Increase from 43.26% to 80% test coverage
- **UI Focus**: Build components that are testable by design
- **Hand-off Pattern**: Build UI → Claude Code adds comprehensive tests

### Upcoming: Referral System Features
- **Referral submission forms** (high-priority UI work)
- **Client referral management dashboard** 
- **Real-time referral status updates**
- **File upload interfaces** for resume handling

## 🚨 Common Pitfalls to Avoid

### Business Rule Violations
- ❌ Don't create "Browse Jobs" pages or components
- ❌ Don't add "Apply Now" buttons or direct application flows
- ❌ Don't show candidates job listings they can apply to
- ❌ Don't create public job board style interfaces

### Technical Mistakes  
- ❌ Don't use `any` types without strong justification
- ❌ Don't skip proper error handling in components
- ❌ Don't hardcode API endpoints - use environment variables
- ❌ Don't bypass role-based access controls

### UX Mistakes
- ❌ Don't create confusing navigation between role types
- ❌ Don't use consumer-grade UI patterns (keep it executive)
- ❌ Don't skip loading states and error messages
- ❌ Don't make assumptions about user permissions

## 📚 Key Reference Files

### Must-Read Before Development
- `CONTEXT_ANCHORS.md` - Quick rules and current priorities
- `.claude-suite/CLAUDE.md` - Complete development context
- `.claude-suite/workflows/feature-development.md` - Standard process

### Architecture References
- `ARCHITECTURE.md` - Technical system design
- `SYSTEM_INTEGRATION.md` - Tool usage guidelines
- `PROJECT_STATE.md` - Current development status

---

**Remember**: Refer-ify is a **referral-only executive recruitment platform**. Every design decision should support warm professional introductions, never cold applications. Maintain executive-grade quality in every pixel.

**Last Updated**: January 2025  
**Status**: Active Development Guidelines