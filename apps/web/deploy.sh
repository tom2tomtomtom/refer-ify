#!/bin/bash
# Railway Deployment Script for Refer-ify
set -e

echo "🚆 Starting Railway deployment for Refer-ify..."
echo "=====================================\n"

# Check if logged in
if ! railway status > /dev/null 2>&1; then
    echo "❌ Not logged in to Railway. Please run:"
    echo "   railway login"
    echo ""
    exit 1
fi

echo "✅ Railway CLI authenticated"

# Check if project is linked
if ! railway status > /dev/null 2>&1; then
    echo "🔗 Linking to Railway project..."
    railway link
fi

echo "✅ Project linked"

# Show current project info
echo "📋 Project Information:"
railway status

echo "\n🔧 Setting up environment variables..."
echo "⚠️  Please ensure these are set in Railway dashboard:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - STRIPE_SECRET_KEY"
echo "   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
echo "   - STRIPE_WEBHOOK_SECRET"
echo "   - OPENAI_API_KEY"

echo "\n🏗️  Building and deploying to Railway..."
railway up

echo "\n✅ Deployment complete!"
echo "🌍 Your app should be available at:"
railway domain

echo "\n🧪 Running post-deploy checks..."
echo "1. Health check: /api/auth"
echo "2. Test pages: /client/analytics, /founding/referrals"
echo "3. AI features: Try candidate matching"
echo "4. Payments: Test job posting flow"

echo "\n📊 View logs:"
echo "   railway logs"
echo "\n🚀 Open app:"
echo "   railway open"