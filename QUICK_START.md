# Quick Start Guide - Refer-ify

## First Time Setup
```bash
# 1. Navigate to project
cd /Users/thomasdowuona-hyde/refer-ify

# 2. Initialize Next.js (if not done)
npm create next-app@latest . --typescript --tailwind --app

# 3. Install Supabase and key dependencies
npm install @supabase/supabase-js @supabase/ssr @supabase/auth-helpers-nextjs
npm install stripe @stripe/stripe-js openai
npm install @radix-ui/react-dialog @radix-ui/react-select

# 4. Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase and API keys
```

## Daily Commands
- **Morning**: "Good morning, what's next for Refer-ify?"
- **Stuck**: "I'm stuck on [describe the issue]"
- **Error**: "Error: [paste error message]"
- **Progress**: "Show me today's progress"
- **Help**: "I need help with [specific task]"

## Vibe Coding for Refer-ify
- "Build the Founding Circle network earnings dashboard"
- "Add referral submission for people I know personally"
- "Create client requirement posting (private, not public)"
- "Make the referral submission form executive-friendly"
- "Add LinkedIn OAuth authentication for network verification"

## Direct Specialist Access
- "Review the referral submission flow for professional networks"
- "Optimize the network earnings calculation system"
- "Add Stripe Connect for referral fee distribution"
- "Make dashboards executive-friendly and responsive"

## Direct Tool Usage

### Cursor (Primary Development)
```bash
# Open in Cursor
cursor /Users/thomasdowuona-hyde/refer-ify

# Cursor AI Commands (Cmd+I):
# "Create the Founding Circle dashboard with job analytics"
# "Build candidate referral form with file upload"
# "Design subscription tier selection interface"
# "Add AI match score visualization"
```

### Claude Code (Backend & AI)
```bash
# Key commands for Refer-ify with Supabase:
# "Generate Supabase Auth with multi-role system and RLS"
# "Build GPT-4 resume parsing with Supabase Storage integration"
# "Create Stripe Connect payment processing"
# "Set up Supabase schema for recruitment platform with real-time"
```

### Quick Development Patterns
```bash
# New Feature Development:
# 1. Use Cursor for UI components
# 2. Use Claude Code for backend logic  
# 3. Test and iterate
# 4. Use Augment for optimization (when needed)
```

## Environment Variables Needed
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# OpenAI
OPENAI_API_KEY=

# LinkedIn (configured in Supabase Auth dashboard)
# LINKEDIN_CLIENT_ID=
# LINKEDIN_CLIENT_SECRET=
```

## Common Development Tasks

### Authentication Setup
1. "Set up Supabase Auth with LinkedIn OAuth for multi-role system"
2. "Create user role management with RLS policies"
3. "Build role-based dashboard routing with Supabase"

### Core Platform Features  
1. "Build client requirement posting (private, network-only access)"
2. "Create referral submission for people you know personally"
3. "Add subscription tier selection for network access"
4. "Build relationship-based referral matching with consent"

### AI Integration
1. "Integrate GPT-4 for resume analysis of referred candidates"
2. "Create referral-requirement matching with relationship context"
3. "Build real-time network performance notifications"

## Remember:
- **Start simple** - the system handles complexity
- **Use Cursor first** - perfect for 0-10K lines
- **Paste errors immediately** - get instant solutions
- **Say "what's next?"** when unsure
- **Trust the AI tools** - they know the patterns

## Ready to Build?
Just say: **"Let's start building the Refer-ify referral system for professional network monetization"** and we'll begin! 🚀