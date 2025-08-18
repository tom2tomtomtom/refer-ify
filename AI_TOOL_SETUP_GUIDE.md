# 🤖 AI Tool Setup Guide - Refer-ify

> **Purpose**: Step-by-step guide to ensure Claude Code and Cursor follow your documentation perfectly

## 🚀 Quick Setup (2 minutes)

### ✅ Step 1: Initialize Husky (Pre-commit Hooks)
```bash
# Install husky if not already installed
npm install --save-dev husky

# Initialize husky
npx husky install

# Your pre-commit hook is already created at .husky/pre-commit
# It will automatically check for business rule violations
```

### ✅ Step 2: Test Business Rule Enforcement
```bash
# Test the pre-commit hook
git add .
git commit -m "Test business rule compliance"

# You should see:
# 🔍 Running Refer-ify business rule compliance checks...
# ✅ Business rule compliance checks passed
```

### ✅ Step 3: Cursor Setup
Cursor will automatically read `.cursor/instructions.md` - no additional setup needed!

**Verify Cursor Setup:**
1. Open Cursor in your project
2. Press `Cmd+I` to open chat
3. Type: "What are the core business rules for this platform?"
4. Cursor should mention referral-only, no job browsing, etc.

## 🎯 Daily Usage Workflow

### Starting a Claude Code Session
**Copy-paste this template:**
```markdown
Context Check for Refer-ify Development:

**Platform Overview:**
- Referral-only executive recruitment platform (never job board)
- Current tech: Next.js 15 + React 19 + TypeScript + Supabase
- User roles: Founding Circle → Select Circle → Client → Candidate (no browsing)
- Quality standard: Executive-grade professional experience

**Current Priority:**
- Test coverage enhancement: 43.26% → 80% target
- Reference: .claude-suite/specs/test-coverage-80-percent.md

**Business Rules (Critical):**
1. NO job board features - candidates cannot browse jobs
2. ALL referrals from personal relationships only
3. Role-based access strictly enforced
4. Executive-grade UX standards required

Ready to proceed following documented workflows?
```

### Starting a Cursor Session
**Just open Cursor and start working!** 
The `.cursor/instructions.md` file provides all needed context automatically.

**Optional verification prompt:**
```markdown
Quick context check: What type of platform is Refer-ify and what are the core business rules I must never violate?
```

### Mid-Session Validation (Use every 3-4 interactions)
**For any AI tool:**
```markdown
Quick Compliance Check:
- Business rules maintained? (referral-only, no candidate browsing)
- Quality standards met? (executive-grade UX, comprehensive testing)
- Documentation followed? (specific workflow or specification)
```

## 📋 Key Files You Created

### 🎯 CONTEXT_ANCHORS.md
**Purpose**: Instant reference for both AI tools
**Usage**: Quick rule refresher during development
**Key sections**: Never Do, Always Do, Current Priority, Tool Selection

### 🎨 .cursor/instructions.md  
**Purpose**: Cursor-specific development guidelines
**Usage**: Automatic context loading for Cursor
**Key sections**: Business rules, tech stack, component patterns

### 🏗️ src/lib/constants/businessRules.ts
**Purpose**: Enforce platform rules in code
**Usage**: Import constants instead of hardcoding values
```typescript
import { BUSINESS_RULES, validateBusinessRules } from '@/lib/constants/businessRules';

// Use constants
const feePercent = BUSINESS_RULES.FINANCIAL_RULES.FEE_DISTRIBUTION.SELECT_CIRCLE_FEE;

// Use validation
validateBusinessRules.enforceReferralOnly('browse_jobs', userRole);
```

### 🛡️ .husky/pre-commit
**Purpose**: Prevent business rule violations before commit
**Usage**: Automatically runs on `git commit`
**Checks**: Job board violations, direct applications, type errors

### 📝 .claude-suite/session-templates.md
**Purpose**: Ready-to-use AI session starters
**Usage**: Copy appropriate template when starting sessions
**Templates**: General, Testing, API, UI, Component development

### ✅ .claude-suite/validation-prompt.md
**Purpose**: Universal validation for any AI tool
**Usage**: Copy-paste when AI suggests questionable approaches
**Sections**: Initial validation, mid-session checks, emergency reminders

## 🔄 Advanced Usage Patterns

### Tool Hand-off (Cursor → Claude Code)
1. **In Cursor**: Build UI component with proper TypeScript interfaces
2. **Hand-off message**: "Claude Code: implement backend API for this component"
3. **In Claude Code**: Reference the UI requirements and implement backend
4. **Result**: Seamless integration with context preservation

### Tool Hand-off (Claude Code → Cursor)  
1. **In Claude Code**: Implement API routes with proper error handling
2. **Hand-off message**: "Cursor: build executive-grade UI for these endpoints"
3. **In Cursor**: Create polished interface consuming the API
4. **Result**: Professional UI with robust backend integration

### Emergency Business Rule Recovery
**If AI suggests job board features:**
```markdown
🚨 BUSINESS RULE VIOLATION: This suggests job browsing for candidates, which violates our referral-only platform model. Please reference CONTEXT_ANCHORS.md and revise to support referral-only interactions.
```

## 📊 Success Metrics

### ✅ You'll Know It's Working When:
- **Claude Code** automatically mentions referral-only rules
- **Cursor** suggests executive-grade UI patterns
- **Pre-commit hooks** catch business rule violations
- **Both tools** reference your business rules constants
- **Development speed** increases with consistent context

### 🚨 Red Flags (Fix Immediately):
- AI suggests "Browse Jobs" features for candidates
- AI creates direct application flows
- AI bypasses role-based access control
- AI uses hardcoded values instead of businessRules.ts constants

## 🛠️ Troubleshooting

### If Cursor Doesn't Follow Guidelines:
1. Check `.cursor/instructions.md` exists and is readable
2. Try explicit prompt: "What are the Refer-ify business rules from .cursor/instructions.md?"
3. Use validation prompt from `.claude-suite/validation-prompt.md`

### If Claude Code Forgets Context:
1. Use session template from `.claude-suite/session-templates.md`
2. Reference specific documentation: "Check CONTEXT_ANCHORS.md for current rules"
3. Use mid-session validation every 3-4 interactions

### If Pre-commit Hooks Fail:
```bash
# Check what the hook found
cat .husky/pre-commit

# Run the checks manually
npm run type-check
npm run lint
npm test -- --coverage --passWithNoTests
```

## 🎯 Next Steps

1. **✅ Test the setup** by starting a Cursor or Claude Code session
2. **✅ Try a commit** to see pre-commit hooks in action  
3. **✅ Reference CONTEXT_ANCHORS.md** whenever you need quick context
4. **✅ Use session templates** for consistent AI interactions
5. **✅ Import businessRules.ts** in your code instead of hardcoding values

## 📚 Quick Reference

**Most Important Files:**
- `CONTEXT_ANCHORS.md` - Quick rules (use daily)
- `.cursor/instructions.md` - Cursor context (automatic)
- `businessRules.ts` - Code constants (import in code)
- `.claude-suite/session-templates.md` - AI session starters

**Emergency Prompts:**
- Business rule violation → Use `.claude-suite/validation-prompt.md`
- Lost context → Copy template from session-templates.md
- Quality issues → Reference .claude-suite/CLAUDE.md

---

**Result**: Both Claude Code and Cursor will now consistently follow your documentation, maintain business rule integrity, and deliver executive-grade quality! 🚀

**Last Updated**: January 2025  
**Status**: Production Ready