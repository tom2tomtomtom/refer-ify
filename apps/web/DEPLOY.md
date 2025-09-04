# Deploying Refer-ify (apps/web)

This guide walks you through a safe deployment to Vercel.

## Prerequisites
- Node.js 20+ (Vercel Project Settings → Node.js Version)
- Supabase project with required tables and RLS
- Stripe + OpenAI keys if enabling payments and AI

## Environment Variables (Vercel → Project Settings → Environment Variables)
Required
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Recommended / server-only
- SUPABASE_SERVICE_ROLE_KEY

Payments (if used)
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET

AI (if used)
- OPENAI_API_KEY

LinkedIn OAuth (if used)
- LINKEDIN_CLIENT_ID
- LINKEDIN_CLIENT_SECRET

Optional
- NEXT_PUBLIC_BASE_URL (e.g., https://your-app.vercel.app)
- NEXT_PUBLIC_SITE_URL

## Pre-deploy checks (local)
```bash
cd apps/web
npm install
npm run build
```

## Deploy steps
1. Push to your main branch (or create a production deployment in Vercel)
2. In Vercel → Settings → Node.js Version: select 20
3. Ensure all environment variables are set for Production
4. Trigger a deployment

## Post-deploy smoke tests
- Client
  - /client/analytics
  - /client/jobs → select a job → /client/jobs/[id]/analytics
- Founding
  - /founding/referrals
- Job detail
  - /client/jobs/[id] → inline edits (title, status, location, compensation, description, skills)

## Monitoring & logging
- Integrate Sentry (server + client init) for errors and performance
- Replace console.* in API routes with a small logger wrapper

## Troubleshooting
- Supabase RLS denies data
  - Confirm profile role and matching client_id for jobs
- 401/403 from APIs
  - Ensure auth cookie flows correctly and env vars are set
- Stripe webhook errors
  - Verify webhook secret matches the Vercel deployment URL endpoint

## Rollback
- In Vercel, select a previous successful deployment and Promote

