# 🚆 Railway Deployment Guide for Refer-ify

## Quick Deploy (One-Command)

```bash
# From /apps/web directory
railway login
railway link
railway up
```

## Step-by-Step Setup

### 1. Login to Railway
```bash
railway login
# This opens browser for authentication
```

### 2. Create New Project (if needed)
```bash
railway link
# Select "Create new project" or link to existing
```

### 3. Set Environment Variables
```bash
# Required Supabase variables
railway variables set NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
railway variables set SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Stripe payment variables
railway variables set STRIPE_SECRET_KEY=your_stripe_secret
railway variables set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_public
railway variables set STRIPE_WEBHOOK_SECRET=your_webhook_secret

# OpenAI for AI features
railway variables set OPENAI_API_KEY=your_openai_key

# LinkedIn OAuth (optional)
railway variables set LINKEDIN_CLIENT_ID=your_linkedin_client
railway variables set LINKEDIN_CLIENT_SECRET=your_linkedin_secret

# Production settings
railway variables set NODE_ENV=production
railway variables set NEXT_PUBLIC_BASE_URL=https://your-app.up.railway.app
```

### 4. Deploy
```bash
railway up
# This builds and deploys your app
```

## Environment Variables Checklist

### ✅ Required (Core Functionality)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

### ✅ Required (Full Features)
- [ ] `STRIPE_SECRET_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `OPENAI_API_KEY`

### ⚡ Optional (Enhanced Features)
- [ ] `LINKEDIN_CLIENT_ID`
- [ ] `LINKEDIN_CLIENT_SECRET`
- [ ] `NEXT_PUBLIC_BASE_URL`

## Railway Configuration Files

### `railway.json` (Created)
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/api/auth"
  }
}
```

### `Dockerfile` (Created)
- Optimized Node.js 20 Alpine image
- Multi-stage build for smaller image size
- Security: Non-root user execution
- Production-ready configuration

## Deployment Commands

### Deploy Current Branch
```bash
railway up
```

### Deploy Specific Service
```bash
railway up --service web
```

### View Logs
```bash
railway logs
```

### Check Deployment Status
```bash
railway status
```

### Open App in Browser
```bash
railway open
```

## Post-Deploy Verification

### 1. Health Check
```bash
curl https://your-app.up.railway.app/api/auth
```

### 2. Database Connection
- Visit: `/client/analytics`
- Verify data loads properly

### 3. Payment Integration
- Test job posting flow
- Verify Stripe webhook endpoint

### 4. AI Features  
- Test candidate matching
- Verify OpenAI integration

## Troubleshooting

### Build Failures
```bash
# Check build logs
railway logs --build

# Local build test
npm run build
```

### Environment Issues
```bash
# List all variables
railway variables

# Test locally with production env
cp .env.production .env.local
npm run dev
```

### Database Connection Issues
- Verify Supabase URL and keys
- Check RLS policies are enabled
- Ensure service role key has proper permissions

## Railway Benefits vs Vercel

### ✅ Railway Advantages
- **Full-stack support**: Database, Redis, etc.
- **No function time limits**: Long-running processes
- **More compute power**: Better for complex operations
- **Simpler pricing**: Pay for what you use
- **Docker support**: More deployment flexibility

### ⚡ Performance Features
- **Auto-scaling**: Based on load
- **Global CDN**: Fast content delivery
- **Built-in monitoring**: Metrics and alerts
- **Zero-downtime deployments**: Rolling updates

## Production Checklist

- [ ] ✅ Environment variables set
- [ ] ✅ Domain configured (optional)
- [ ] ✅ SSL certificate active (automatic)
- [ ] ✅ Health checks passing
- [ ] ✅ Logs monitoring setup
- [ ] ✅ Backup strategy for database

## Cost Estimation

**Hobby Plan (Free)**
- $5 credit/month
- Good for testing/staging

**Pro Plan ($20/month)**  
- Unlimited builds
- Priority support
- Custom domains

Railway is excellent for this full-stack Next.js app with its database and AI integrations!