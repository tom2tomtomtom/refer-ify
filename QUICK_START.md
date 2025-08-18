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
- "Build the Founding Circle member dashboard"
- "Add AI candidate matching to job posts"
- "Create the subscription payment flow"
- "Make the referral submission form"
- "Add LinkedIn OAuth authentication"

## Direct Specialist Access
- "Security audit the Auth0 integration"
- "Optimize the candidate matching algorithm"
- "Add Stripe Connect marketplace payments"
- "Make dashboards fully responsive"

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
1. "Build job posting form with real-time updates"
2. "Create candidate referral with Supabase Storage upload"
3. "Add subscription tier selection and Stripe integration"
4. "Build AI candidate matching with real-time notifications"

### AI Integration
1. "Integrate GPT-4 for resume parsing with Supabase Storage"
2. "Create candidate-job matching with vector embeddings"
3. "Build real-time notification system with Supabase subscriptions"

## Remember:
- **Start simple** - the system handles complexity
- **Use Cursor first** - perfect for 0-10K lines
- **Paste errors immediately** - get instant solutions
- **Say "what's next?"** when unsure
- **Trust the AI tools** - they know the patterns

## Ready to Build?
Just say: **"Let's start building the Refer-ify authentication system"** or **"Initialize the Next.js project structure"** and we'll begin! 🚀