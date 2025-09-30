# 🚨 URGENT: Add Demo Data to All Pages

## Critical Issues in Production:
1. `/founding/revenue` - "Please sign in" message
2. `/select-circle/referrals` - Blank/empty
3. `/select-circle/earnings` - Blank/empty  
4. `/select-circle/network` - Blank/empty

## Root Cause:
Pages check for user (✅ works) but then query database which has no data for demo users.

## Solution:
Add `isDemo` check to each page and return demo data.

## Pages to Fix:
- apps/web/src/app/founding/revenue/page.tsx
- apps/web/src/app/select-circle/referrals/page.tsx
- apps/web/src/app/select-circle/earnings/page.tsx (check if has demo logic)
- apps/web/src/app/select-circle/network/page.tsx

This is critical for CEO to explore independently!
