# 🔧 Database Setup Instructions

## ✨ **Ultimate Dev System - Database Migration Plan**

Your founding circle dashboard needs additional database tables to work with real data instead of fallbacks.

## **Current Status:**
- ✅ Core tables exist: `profiles`, `jobs`, `referrals`, `subscriptions`
- ❌ Missing: `founding_metrics`, `advisory_sessions`, `select_circle_invitations`, etc.
- ⚠️ Current code uses try/catch fallbacks when these tables don't exist

---

## **🚀 Step-by-Step Setup:**

### **Step 1: Apply Database Migration**
```bash
# Navigate to your project
cd /users/thomasdowuona-hyde/refer-ify

# Apply the new migration
npx supabase db push

# Or if using Supabase CLI locally:
supabase migration up
```

### **Step 2: Get Your User ID**
Run this query in Supabase Dashboard > SQL Editor:
```sql
-- Find your user ID
SELECT id, email FROM auth.users WHERE email = 'thyde_uk@icloud.com';
-- OR
SELECT id, email FROM public.profiles WHERE email = 'thyde_uk@icloud.com';
```

### **Step 3: Update Seed File**
1. Copy the user ID from Step 2
2. Open: `/supabase/seed_founding_circle.sql`
3. Replace all instances of `'YOUR_USER_ID_HERE'` with your actual UUID
4. Save the file

### **Step 4: Apply Seed Data**
```bash
# Run the seed file to populate with realistic data
psql -h your-supabase-host -d postgres -U postgres -f supabase/seed_founding_circle.sql

# OR use Supabase Dashboard > SQL Editor and paste the updated seed content
```

### **Step 5: Verify Data**
Run in Supabase SQL Editor:
```sql
-- Check your founding metrics
SELECT * FROM public.founding_metrics WHERE user_id = 'YOUR_USER_ID';

-- Check advisory sessions
SELECT * FROM public.advisory_sessions WHERE founder_id = 'YOUR_USER_ID';

-- Check invitations
SELECT * FROM public.select_circle_invitations WHERE founder_id = 'YOUR_USER_ID';
```

---

## **🎯 What This Unlocks:**

After the database update, your founding circle dashboard will have:

### **Real Data Instead of Fallbacks:**
- ✅ **Network metrics** from actual member activity
- ✅ **Revenue tracking** with monthly trends
- ✅ **Advisory session management** with real scheduling
- ✅ **Invitation system** with proper tracking
- ✅ **Growth charts** with historical data

### **New Functionality:**
- 📊 **Real revenue calculations** from placement fees
- 👥 **Network member analytics** and growth tracking  
- 📅 **Advisory calendar** with session management
- 📧 **Professional invitation system** with status tracking
- 💰 **Revenue distribution** calculations (15% founding share)

---

## **🔧 Alternative: Quick Start Without Migration**

If you want to **build the UI first and connect data later**:

1. **Skip the migration** for now
2. **Use the updated Cursor prompts** (they handle missing tables gracefully)
3. **Build the dashboard pages** with the existing fallback pattern
4. **Apply database changes later** when you're ready for real data

---

## **📋 Ready to Proceed?**

**Option A: Full Database Setup** (Recommended)
- Apply migration → Update seed file → Get real data dashboard

**Option B: UI Development First**  
- Skip database → Build pages with fallbacks → Connect real data later

**Which approach would you prefer?**

Once you choose, I'll provide the **updated Cursor prompts** that work with your decision!
