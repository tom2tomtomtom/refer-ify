# 🚀 REFER-IFY DEVELOPMENT COMMANDS

## Ultimate Dev System Commands

### Daily Startup
```bash
cd /Users/thomasdowuona-hyde/refer-ify
code . # Open in Cursor
npm run dev # Start development server
```

### Vibe Coding Commands
- "Build the multi-role authentication system"
- "Create the AI candidate matching engine" 
- "Add Stripe subscription processing"
- "Make the dashboard responsive"
- "Fix whatever is broken"

### Tool-Specific Commands

#### Cursor (Primary Development)
```bash
# Open project in Cursor
cursor /Users/thomasdowuona-hyde/refer-ify

# Cursor AI Commands (Cmd+I):
# "Create user dashboard for Founding Circle members"
# "Build job posting form with validation"
# "Design candidate referral interface"
# "Add payment subscription components"
```

#### Claude Code (Backend Logic)
```bash
# Generate backend components with Supabase
claude generate api --name candidate-matching --supabase-integration
claude generate auth --provider supabase --linkedin-oauth
claude generate payments --stripe-connect --multi-tier
claude generate database --schema refer-ify --supabase
```

#### Augment (Large Scale Changes)
```bash
# When codebase grows beyond 10K lines
# Use Augment for:
# - Large refactoring operations
# - Performance optimization
# - Architecture improvements
# - Cross-cutting concerns
```

### Development Workflow

#### Week 1: Foundation
```bash
# Day 1-2: Project Setup
npm create next-app@latest . --typescript --tailwind --app
npm install @supabase/supabase-js @supabase/ssr @supabase/auth-helpers-nextjs
npm install stripe @stripe/stripe-js openai

# Day 3-4: Authentication
# Use Cursor: "Set up Supabase Auth with LinkedIn OAuth integration"
# Use Claude Code: "Generate user role-based authentication with RLS"

# Day 5-7: Basic UI
# Use Cursor: "Create dashboards for all user roles with Supabase integration"
```

#### Week 2: Core Features  
```bash
# Job Management
# Use Cursor: "Build job posting interface with Supabase real-time"
# Use Claude Code: "Generate job API with role-based access and RLS"

# Candidate System
# Use Cursor: "Create candidate referral forms with Supabase Storage"
# Use Claude Code: "Build candidate processing pipeline with file upload"
```

#### Week 3-4: AI Integration
```bash
# AI Matching Engine
# Use Claude Code: "Integrate GPT-4 for resume parsing"
# Use Claude Code: "Build candidate ranking algorithm"
# Use Cursor: "Display AI match scores in UI"
```

## Environment Setup Commands

### Node.js & Dependencies
```bash
# Ensure Node.js 20+ is installed
node --version
npm --version

# Install project dependencies
npm install

# Install Supabase dependencies
npm install @supabase/supabase-js @supabase/ssr @supabase/auth-helpers-nextjs

# Install development tools
npm install -D @types/node typescript nodemon
```

### Database Setup
```bash
# Supabase CLI setup
npm install -g supabase
supabase login

# Initialize Supabase project
supabase init

# Link to existing Supabase project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Authentication Setup
```bash
# Supabase Auth configuration
# Set environment variables:
# NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY

# LinkedIn OAuth setup in Supabase dashboard
# Configure LinkedIn provider with client ID and secret
```

### Payment Setup
```bash
# Stripe configuration
# Set environment variables:
# STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY
# STRIPE_WEBHOOK_SECRET
```

## Quick Start Commands

### First Time Setup
```bash
cd /Users/thomasdowuona-hyde/refer-ify
npm install
cp .env.example .env.local
# Edit .env.local with Supabase and Stripe API keys
npm run dev
```

### Daily Development
```bash
cd /Users/thomasdowuona-hyde/refer-ify
npm run dev
# Open Cursor and start building!
```

### Debugging Commands
```bash
npm run lint
npm run type-check
npm run test
npm run build
```

## AI-Assisted Development Tips

### Cursor AI Prompts
- "Create a [component] that [functionality]"
- "Fix this [error/issue] in [file]"  
- "Optimize this [function/component] for [performance/readability]"
- "Add [feature] to this [component/page]"

### Claude Code Prompts
- "Generate [backend feature] with [specifications]"
- "Create database [schema/migration] for [functionality]"
- "Build API [endpoint] that [handles specific business logic]"
- "Integrate [third-party service] for [use case]"

### Common Development Patterns
```bash
# Generate new feature
# 1. Use Claude Code for backend API
# 2. Use Cursor for frontend UI
# 3. Use Augment for optimization (when needed)
```
