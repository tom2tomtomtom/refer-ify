# 🚀 Candidate Referral System Setup

## **Database Migration Required**

### **Step 1: Apply Migration**
```bash
cd /users/thomasdowuona-hyde/refer-ify
npx supabase db push
```

### **Step 2: Run Seed Data**
Copy and paste the contents of `/supabase/seed_candidate_system.sql` into **Supabase Dashboard > SQL Editor** and run it.

### **Step 3: Verify Setup**
Should show:
- Candidates Created: 5 records
- Sample Referrals: 3 records  
- AI Analysis Records: 1 record
- Candidate Interactions: 2 records
- Candidate Skills: 5 records

## **What This Enables:**

### **New Tables Created:**
- `candidates`: Complete candidate profiles with skills, preferences, work auth
- `candidate_referrals`: Enhanced referral tracking with relationship context
- `ai_match_analysis`: AI-powered job matching with detailed scoring
- `candidate_interactions`: Full interaction timeline and interview tracking
- `candidate_skills`: Detailed skill profiles with proficiency levels

### **Enhanced Features:**
- **Professional resume upload** with Supabase Storage
- **AI-powered candidate matching** with GPT-4 integration
- **Complete candidate lifecycle** from referral to hire
- **Advanced candidate search** and filtering
- **Interview scheduling** and outcome tracking

### **Sample Data Includes:**
- **5 realistic candidates** across different roles and experience levels
- **3 sample referrals** with different status stages
- **AI match analysis** with detailed scoring and recommendations
- **Interaction timeline** showing referral and screening progress
- **Skills database** with proficiency levels and categories

## **Ready for Cursor Development!**

After running the database setup, you'll be ready to build:

1. **Candidate Referral Form** - Professional referral submission with file upload
2. **Candidate Management Dashboard** - Track and manage referred candidates  
3. **AI Matching Interface** - GPT-4 powered candidate-job matching
4. **Interview Tracking** - Complete interaction timeline and scheduling

The system now supports the full candidate referral workflow with enterprise-grade data management!
