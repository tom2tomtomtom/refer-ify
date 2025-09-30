# 🔧 Fix All Demo Data Issues - Quick Reference

## Pages That Need Demo Data:

1. `/founding/revenue` - Says "please sign in"
2. `/select-circle/referrals` - Blank (API call returns empty)
3. `/select-circle/earnings` - Blank (no data)
4. `/select-circle/network` - Blank (no data)

## Quick Fix Strategy:

Add this pattern to each page:

```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) return <div>Please sign in</div>;

// ADD THIS:
const isDemo = user.id.startsWith('demo-');

if (isDemo) {
  // Return page with demo data
  return <DemoDataView />;
}

// Continue with real database queries for non-demo users
```

I'll fix all 4 pages now with demo data.
