# Refer-ify Architectural Decisions

> Created: August 18, 2025
> Format: Decision Records with Context and Consequences

## DEC-001: Next.js 15 + Supabase Architecture

**Date:** August 18, 2025  
**Status:** Implemented  
**Category:** Technical Foundation

### Decision
Choose Next.js 15 with App Router + Supabase for full-stack development instead of separate frontend/backend services.

### Context
- Need rapid MVP development with limited resources
- Require real-time features for job feed updates
- Multi-role authentication with secure data access
- Executive-grade UI/UX requirements
- Global scalability from day one

### Consequences

**Positive:**
- **Unified Codebase:** Single repository for frontend and API routes
- **Real-time Built-in:** Supabase provides WebSocket subscriptions
- **Authentication Included:** Supabase Auth with OAuth providers
- **Type Safety:** End-to-end TypeScript including database types
- **Deployment Simplicity:** Vercel optimized for Next.js
- **Row Level Security:** Database-level access control for multi-tenancy

**Trade-offs:**
- **Vendor Lock-in:** Heavy dependency on Supabase ecosystem
- **Learning Curve:** Next.js 15 App Router is relatively new
- **Scaling Complexity:** May need service separation at enterprise scale

---

## DEC-002: Referral-Only Platform Design

**Date:** August 18, 2025  
**Status:** Implemented  
**Category:** Business Architecture

### Decision
Build a referral-based recruitment platform where candidates CANNOT browse or apply directly - all connections are relationship-based introductions.

### Context
- Traditional job boards create noise and unqualified applications
- Executive recruitment relies heavily on trusted networks
- "Network = Networth" philosophy drives business model
- Need to differentiate from existing recruitment platforms
- Quality over quantity approach for premium market

### Consequences

**Positive:**
- **Higher Quality:** All referrals come from personal relationships
- **Premium Positioning:** Executive-focused, invitation-only network
- **Network Effects:** Members incentivized to maintain quality
- **Client Value:** Curated referrals vs. mass applications
- **Revenue Model:** Subscription-based with performance incentives

**Trade-offs:**
- **Growth Limitations:** Slower initial user acquisition
- **Network Dependency:** Success requires strong founding member recruitment
- **Complexity:** Multi-role system more complex than simple job board

---

## DEC-003: Multi-Role Hierarchy System

**Date:** August 18, 2025  
**Status:** Implemented  
**Category:** Business Logic

### Decision
Implement three-tier network hierarchy: Founding Circle → Select Circle → Clients, with different access levels and fee structures.

### Context
- Need to create exclusive value proposition for top-tier members
- Require quality control mechanism for network growth
- Want to incentivize network building and management
- Need sustainable revenue model with fee distribution

### Architecture
```
Founding Circle (Invite Only)
├── Access: ALL job requirements regardless of tier
├── Network: Can invite up to 40 Select Circle members
├── Earnings: 40% for direct referrals + 15% from their network
└── Management: Oversee their Select Circle performance

Select Circle (40 per Founding Circle member)
├── Access: Connect + Priority tier jobs (no Exclusive)
├── Referrals: Earn 40% for successful placements
└── Recruitment: By Founding Circle members only

Clients (Revenue Source)
├── Subscriptions: Connect ($500), Priority ($1500), Exclusive ($3000)
├── Access: Post private job requirements to network
└── Receive: Curated referrals based on subscription tier
```

### Consequences

**Positive:**
- **Quality Control:** Founding Circle vets all Select Circle members
- **Financial Incentives:** Clear fee structure motivates participation
- **Exclusivity Value:** Higher tiers provide genuine additional value
- **Network Growth:** Structured expansion through existing members
- **Revenue Predictability:** Subscription model with performance bonuses

**Trade-offs:**
- **Complexity:** Multi-role system requires sophisticated access control
- **Cold Start:** Need to recruit quality Founding Circle members first
- **Balance Challenge:** Must maintain value across all tiers

---

## DEC-004: Comprehensive Testing from Start

**Date:** August 18, 2025  
**Status:** Implemented  
**Category:** Development Quality

### Decision
Implement full testing infrastructure (Jest + Playwright + MSW) from early development rather than adding tests later.

### Context
- Executive recruitment requires high reliability and data accuracy
- Multi-role system has complex business logic requiring validation
- Financial transactions (fee distribution) need bulletproof testing
- Team velocity requires confidence in changes
- Professional platform cannot afford production bugs

### Implementation
- **Unit Tests:** Components, utilities, API routes (80-90% coverage)
- **Integration Tests:** Complete user flows and business processes
- **E2E Tests:** Critical paths like referral submission, payment processing
- **API Mocking:** MSW for consistent test data across environments
- **CI/CD Pipeline:** Automated testing on all pull requests

### Consequences

**Positive:**
- **Reliability:** Catch bugs before they reach production
- **Confidence:** Safe refactoring and feature development
- **Documentation:** Tests serve as living documentation
- **Professional Quality:** Enterprise-grade development practices
- **Team Velocity:** Less debugging, more feature development

**Trade-offs:**
- **Initial Setup Time:** Comprehensive test infrastructure requires upfront investment
- **Maintenance Overhead:** Tests need updating with feature changes
- **Learning Curve:** Team needs testing best practices knowledge

---

## DEC-005: TypeScript Everywhere

**Date:** August 18, 2025  
**Status:** Implemented  
**Category:** Developer Experience

### Decision
Use TypeScript throughout the entire stack including API routes, database types, and component props.

### Context
- Complex business logic with multiple user roles
- Need type safety for financial calculations and fee distribution
- Database schema changes should be reflected in application types
- Team productivity requires excellent IDE support
- Executive platform cannot afford runtime type errors

### Implementation
- **Database Types:** Auto-generated from Supabase schema
- **API Types:** Shared interfaces for request/response objects
- **Component Props:** Strict typing for all React components
- **Business Logic:** Type-safe calculations and validations

### Consequences

**Positive:**
- **Runtime Safety:** Catch type errors at compile time
- **IDE Support:** Excellent autocomplete and refactoring
- **Self-Documenting:** Types serve as inline documentation
- **Refactoring Confidence:** Safe large-scale code changes
- **Team Onboarding:** Clear contracts between components

**Trade-offs:**
- **Initial Learning Curve:** TypeScript expertise required
- **Build Complexity:** Additional compilation step
- **Type Maintenance:** Types need updating with schema changes

---

## DEC-006: Real-time Job Feed Architecture

**Date:** August 18, 2025  
**Status:** Implemented  
**Category:** Feature Architecture

### Decision
Use Supabase real-time subscriptions for live job feed updates instead of polling or manual refresh.

### Context
- Executive opportunities are time-sensitive
- Network members need immediate notification of relevant roles
- Competitive advantage through fast referral response times
- Professional user experience expectations

### Implementation
```typescript
// Real-time subscription with role-based filtering
const channel = supabase
  .channel("job-feed-realtime")
  .on("postgres_changes", {
    event: "INSERT",
    schema: "public", 
    table: "jobs",
    filter: "status=eq.active"
  }, handleNewJob)
```

### Consequences

**Positive:**
- **Immediate Updates:** Jobs appear instantly across all connected clients
- **Competitive Advantage:** Faster referral response times
- **Professional UX:** No manual refresh required
- **Scalability:** WebSocket connections handle thousands of concurrent users
- **Battery Efficiency:** No constant polling from mobile devices

**Trade-offs:**
- **Connection Management:** Need to handle disconnects and reconnects
- **Server Load:** WebSocket connections consume more resources than REST
- **Debugging Complexity:** Real-time bugs harder to reproduce

---

## Future Architectural Decisions

### Upcoming Decisions
- **AI Provider Selection:** OpenAI vs. Anthropic vs. hybrid approach
- **Payment Architecture:** Stripe Connect vs. direct integration
- **Mobile Strategy:** React Native vs. Progressive Web App
- **Monitoring Stack:** Error tracking and performance monitoring tools
- **Internationalization:** Multi-language and currency support

### Decision Criteria
All future architectural decisions will be evaluated based on:
1. **Executive User Experience:** Professional, polished, fast
2. **Business Model Support:** Enables referral-based networking
3. **Scalability:** Can grow to 10,000+ active network members
4. **Reliability:** 99.9% uptime for professional platform
5. **Development Velocity:** Supports rapid iteration and deployment