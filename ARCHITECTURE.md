# 🔧 REFER-IFY TECHNICAL ARCHITECTURE

## System Overview
Multi-tenant SaaS platform for executive recruitment with AI-powered matching.

## Frontend Architecture (Next.js 14)
```
app/
├── (auth)/                 # Authentication layouts
│   ├── login/
│   └── register/
├── (dashboard)/           # Protected dashboard routes
│   ├── founding-circle/   # Founding Circle member dashboard
│   ├── select-circle/     # Select Circle member dashboard  
│   ├── client/           # Client company dashboard
│   ├── candidate/        # Candidate dashboard
│   └── admin/            # Platform admin dashboard
├── api/                  # API routes
│   ├── auth/            # Authentication endpoints
│   ├── users/           # User management
│   ├── jobs/            # Job management
│   ├── referrals/       # Referral processing
│   ├── payments/        # Stripe integration
│   ├── ai/              # AI matching endpoints
│   └── webhooks/        # External service webhooks
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── forms/          # Form components
│   ├── dashboard/      # Dashboard-specific components
│   └── charts/         # Analytics components
└── lib/                # Utility libraries
    ├── auth.ts         # Auth0 configuration
    ├── db.ts           # Database connection
    ├── stripe.ts       # Stripe configuration
    ├── openai.ts       # OpenAI integration
    └── utils.ts        # General utilities
```

## Backend Architecture (API Routes + External Services)
```
Backend Services:
├── Authentication      # Auth0 + LinkedIn OAuth
├── User Management     # Multi-role system
├── Job Management      # CRUD + search
├── Referral Engine     # Candidate processing
├── AI Matching         # GPT-4 + embeddings
├── Payment Processing  # Stripe Connect
├── Notification System # Email + in-app
└── Analytics Engine    # Reporting + insights
```

## Database Schema (PostgreSQL)
```sql
-- Core Tables
users                   # All platform users
user_profiles          # Extended profile information
jobs                   # Job postings
candidates             # Candidate information  
referrals              # Referral submissions
subscriptions          # Client subscriptions
placements             # Successful hires
notifications          # System notifications
analytics_events       # Tracking events

-- Support Tables
invitation_codes       # Founding/Select Circle invites
consent_records        # GDPR compliance
audit_logs            # Security and compliance
payment_transactions   # Financial records
ai_match_scores       # AI matching results
```

## User Role Architecture
```typescript
enum UserRole {
  FOUNDING_CIRCLE = 'founding_circle',   # Elite executives
  SELECT_CIRCLE = 'select_circle',       # Quality referrers  
  CLIENT = 'client',                     # Hiring companies
  CANDIDATE = 'candidate',               # Job candidates
  ADMIN = 'admin'                        # Platform admin
}

// Role-based access control
const permissions = {
  founding_circle: ['view_all_jobs', 'invite_select_circle', 'access_analytics'],
  select_circle: ['view_tier_jobs', 'submit_referrals', 'view_earnings'],
  client: ['post_jobs', 'view_referrals', 'access_candidates'],
  candidate: ['view_profile', 'manage_consent'],
  admin: ['manage_platform', 'view_all_data']
};
```

## AI Integration Architecture
```typescript
// AI Services Pipeline
const aiPipeline = {
  resumeParsing: {
    service: 'OpenAI GPT-4',
    input: 'PDF/DOC resume files',
    output: 'Structured candidate data',
    processing: 'Extract skills, experience, education'
  },
  
  skillEmbeddings: {
    service: 'OpenAI text-embedding-3-large', 
    input: 'Skills and job requirements',
    output: 'Vector embeddings',
    storage: 'PostgreSQL pgvector'
  },
  
  candidateMatching: {
    service: 'Custom algorithm + GPT-4',
    input: 'Job requirements + candidate profiles',
    output: 'Match scores + explanations',
    processing: 'Vector similarity + contextual analysis'
  },
  
  intelligentSuggestions: {
    service: 'GPT-4 + network analysis',
    input: 'Job posting + network data',
    output: 'Suggested referrers',
    processing: 'Network strength + skill relevance'
  }
};
```

## Payment Architecture (Stripe Connect)
```typescript
// Multi-party payment flow
const paymentFlow = {
  subscriptions: {
    tiers: ['connect', 'priority', 'exclusive'],
    billing: 'Monthly recurring',
    distribution: 'Platform 95%, Founding Circle 5%'
  },
  
  placements: {
    fees: '6-12% of annual salary',
    distribution: {
      platform: '45%',
      select_circle: '40%', 
      founding_circle: '15%'
    },
    escrow: '3-month guarantee period'
  }
};
```

## Security Architecture
```typescript
const securityLayers = {
  authentication: 'Auth0 with MFA',
  authorization: 'Role-based access control',
  dataEncryption: 'AES-256 at rest, TLS 1.3 in transit',
  compliance: 'GDPR, SOC 2, ISO 27001 frameworks',
  monitoring: 'Sentry error tracking + audit logs',
  rateLimit: 'Per-user and per-IP limiting'
};
```

## Development Environment Configuration
```bash
# Required Environment Variables
AUTH0_SECRET=
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=

STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

OPENAI_API_KEY=

DATABASE_URL=postgresql://user:password@localhost:5432/referify
REDIS_URL=redis://localhost:6379

LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

SENDGRID_API_KEY=
SENTRY_DSN=
```

## Deployment Architecture
```yaml
Production:
  Frontend: 
    platform: Vercel
    domains: ['app.refer-ify.com']
    regions: [Sydney, Singapore, London]
    
  Backend APIs:
    platform: Railway
    scaling: Auto (2-20 instances)
    regions: [Australia, Singapore, Europe]
    
  Database:
    primary: Neon PostgreSQL (Australia)
    replicas: [Singapore, Europe]
    backup: Daily automated
    
  Cache:
    service: Upstash Redis
    regions: Multi-region
    
  CDN:
    service: Vercel Edge Network
    caching: Aggressive for static assets
```

## Development Workflow Integration
```typescript
// Ultimate Dev System Integration
const devWorkflow = {
  cursor: {
    use: 'UI development, component creation',
    aiFeatures: 'Code completion, bug detection',
    integration: 'Direct file editing and preview'
  },
  
  claudeCode: {
    use: 'Backend logic, API development',  
    aiFeatures: 'Complex business logic generation',
    integration: 'Terminal commands and automation'
  },
  
  augment: {
    use: 'Large refactoring, optimization',
    aiFeatures: 'Architecture improvements',
    integration: 'VS Code extension'
  }
};
```

## Monitoring & Analytics
```typescript
const monitoring = {
  performance: 'DataDog APM',
  errors: 'Sentry error tracking', 
  uptime: 'UptimeRobot monitoring',
  analytics: 'PostHog product analytics',
  logs: 'Railway built-in logging',
  
  businessMetrics: {
    userEngagement: 'Login frequency, feature usage',
    referralSuccess: 'Conversion rates by role',
    revenueTracking: 'Subscription and placement revenue',
    aiPerformance: 'Match accuracy and user satisfaction'
  }
};
```

## Scalability Considerations
```typescript
const scalability = {
  database: {
    approach: 'Read replicas + connection pooling',
    indexing: 'Optimized for search patterns',
    caching: 'Redis for frequently accessed data'
  },
  
  api: {
    approach: 'Horizontal scaling with load balancing',
    rateLimit: 'Per-user limits to prevent abuse',
    caching: 'Response caching for expensive operations'
  },
  
  ai: {
    approach: 'Queue-based processing for heavy AI tasks',
    fallback: 'Graceful degradation when AI unavailable',
    optimization: 'Batch processing for efficiency'
  }
};
```
