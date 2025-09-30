#!/bin/bash

# Quick deployment script for production navigation fixes

cd /Users/thomasdowuona-hyde/refer-ify

echo "📋 Adding changed files..."
git add apps/web/src/components/home/SolutionsSidebar.tsx
git add apps/web/src/app/page.tsx
git add apps/web/src/app/layout.tsx
git add PRODUCTION_NAVIGATION_FIXES.md
git add GIT_PUSH_COMMANDS.sh

echo "📝 Committing changes..."
git commit -m "🔥 HOTFIX: Fix critical production navigation issues

CRITICAL FIXES:
- Added 'Sign In' link to header for anonymous users
- Fixed Solutions sidebar to link to public pages (not auth-protected)
- Fixed homepage CTAs to go to marketing pages
- All navigation now works in production

BEFORE:
- ❌ No Sign In link visible
- ❌ Solutions sidebar → 404 errors
- ❌ Homepage buttons → broken links

AFTER:
- ✅ Sign In link in header nav
- ✅ Solutions sidebar → public pages
- ✅ Homepage buttons → correct destinations

IMPACT:
- Users can now sign in from any page
- All homepage buttons functional
- Solutions sidebar fully working
- No more 404 errors on homepage

FILES CHANGED:
- apps/web/src/components/home/SolutionsSidebar.tsx
- apps/web/src/app/page.tsx
- apps/web/src/app/layout.tsx
- PRODUCTION_NAVIGATION_FIXES.md"

echo "🚀 Pushing to main..."
git push origin main

echo "✅ Done! Check your deployment platform for build status."
echo ""
echo "🔍 Verify after deployment:"
echo "  1. Homepage loads"
echo "  2. 'Sign In' link appears in header"
echo "  3. 'Request Invitation' → /join-network"
echo "  4. Solutions sidebar buttons all work"
echo ""
echo "Production URL: [Your deployment URL]"
