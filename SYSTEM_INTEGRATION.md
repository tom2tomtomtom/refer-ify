# System Integration Map - Refer-ify

## Automatic Routing Rules

### By Project Size:
- 0-10K lines → Cursor (current - perfect for Refer-ify)
- 10K-50K lines → Transition to Augment
- 50K+ lines → Augment primary

### By Task Type:
- "build UI/dashboard" → Cursor + frontend-developer
- "authentication setup" → Cursor + security-auditor + Supabase Auth
- "database schema" → Claude Code + Supabase migrations
- "AI integration" → Claude Code + ai-integration-expert + Supabase Storage
- "fix bug" → debugger + appropriate tool
- "add payments" → Cursor + payment-specialist + Claude Code
- "real-time features" → Cursor + Supabase subscriptions
- "optimize performance" → Augment + performance-engineer
- "write tests" → Claude Code + test-automator

### By Error Type:
- Supabase Auth errors → security-auditor + Supabase Auth specialist
- Database/RLS errors → database-optimizer + Supabase expert
- Storage upload errors → file-upload-specialist + Supabase Storage
- Real-time errors → real-time-specialist + Supabase subscriptions
- Payment errors → payment-specialist + Stripe expert
- AI/API errors → ai-integration-expert + OpenAI specialist
- TypeScript errors → typescript-expert + frontend-developer

## Specialist Activation Triggers

### Refer-ify Specific Triggers:
- "Founding Circle" → activates frontend-developer + business-logic-specialist
- "Select Circle" → activates user-management + referral-specialist  
- "candidate matching" → activates ai-integration-expert + algorithm-specialist
- "job posting" → activates frontend-developer + content-management + real-time
- "payment" or "subscription" → activates payment-specialist + stripe-expert
- "Supabase" or "RLS" → activates database-optimizer + security-auditor
- "LinkedIn" → activates security-auditor + oauth-specialist
- "GDPR" or "compliance" → activates compliance-expert + legal-tech
- "dashboard" or "analytics" → activates frontend-developer + data-visualization
- "real-time" or "live updates" → activates real-time-specialist + Supabase subscriptions
- "file upload" or "resume" → activates file-upload-specialist + Supabase Storage

## Tool Hand-off Patterns

### Cursor → Claude Code
"Continue backend logic with Claude Code"
- When UI is built and need API integration
- For complex business logic implementation
- AI integration and data processing

### Claude Code → Cursor  
"Build UI for this API with Cursor"
- After backend/AI logic is complete
- For user interface and user experience
- Dashboard and analytics visualization

### Any Tool → Augment
"Optimize entire codebase with Augment"
- When approaching 10K lines
- For performance optimization
- Large-scale refactoring needs

## Refer-ify Development Flow

### Week 1-4: Cursor Primary
- UI components and layouts
- User dashboards and forms
- Basic authentication flows
- Payment interfaces

### Week 5-8: Cursor + Claude Code
- AI integration (Claude Code)
- Complex business logic (Claude Code)  
- UI for AI features (Cursor)
- Testing and debugging (both)

### Week 9-12: All Tools
- Performance optimization (Augment)
- Production deployment (Claude Code)
- Final UI polish (Cursor)
- System integration (all tools)

## Context Switching Signals
- File count > 50 → Consider Augment
- Complex algorithms needed → Claude Code
- UI/UX focus → Cursor
- Cross-cutting changes → Augment
- API integration → Claude Code