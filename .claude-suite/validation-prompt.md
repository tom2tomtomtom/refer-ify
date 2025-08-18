# AI Validation Prompt for Refer-ify

> **Purpose**: Copy-paste validation prompt to ensure any AI tool understands and follows Refer-ify's business rules and documentation

## 🎯 Universal AI Validation Prompt

### Copy-Paste This Into Any AI Session:

```markdown
REFER-IFY DEVELOPMENT VALIDATION:

Before we proceed with any development work, please confirm your understanding of these critical business rules:

**Platform Identity (Confirm Understanding):**
1. Refer-ify is a REFERRAL-ONLY executive recruitment platform
2. Candidates CANNOT browse jobs or apply directly
3. ALL connections come through personal professional relationships
4. This is NOT a job board and must never become one

**User Role System (Confirm Understanding):**
- Founding Circle: Elite executives (access all jobs, manage networks, earn 15-40% fees)
- Select Circle: Quality referrers (tiered job access, earn 40% fees, 40 per Founding Circle)
- Client: Companies (post requirements, receive referrals, pay subscriptions $500-$3000)
- Candidate: Professionals (NO platform access initially, referral participation only)

**Quality Standards (Confirm Understanding):**
- Executive-grade professional experience required in all interfaces
- TypeScript strict mode with comprehensive error handling
- Test coverage target: 80% (currently 43.26%)
- Role-based access control strictly enforced

**Current Development Context (Confirm Understanding):**
- Tech Stack: Next.js 15 + React 19 + TypeScript + Supabase + Tailwind + Shadcn/ui
- Priority: Test coverage enhancement (43% → 80%)
- Architecture: Server Components default, Client Components marked
- Testing: Jest + React Testing Library + Playwright + MSW

**Business Rule Enforcement (Confirm Understanding):**
- Use constants from src/lib/constants/businessRules.ts
- All fee calculations: Platform 45%, Select Circle 40%, Founding Circle 15%
- Subscription tiers: Connect ($500), Priority ($1500), Exclusive ($3000)
- Network limits: Max 40 Select Circle per Founding Circle member

**Critical Never-Do List (Confirm Understanding):**
❌ Create job browsing interfaces for candidates
❌ Build "Apply Now" buttons or direct application flows  
❌ Allow candidates to see jobs they can apply to
❌ Skip role-based access control validation
❌ Compromise executive-grade UX standards
❌ Use 'any' TypeScript types without justification

**Documentation References (Confirm Access):**
- CONTEXT_ANCHORS.md: Quick reference rules
- .claude-suite/CLAUDE.md: Complete development context
- .cursor/instructions.md: Cursor-specific guidelines  
- .claude-suite/workflows/feature-development.md: Standard process
- src/lib/constants/businessRules.ts: Rule enforcement constants

**Confirmation Required:**
Please respond with: "✅ I understand Refer-ify is a referral-only executive recruitment platform with strict role-based access. I will not create job board features and will maintain executive-grade quality standards. I have access to the documentation references."

Only after this confirmation will we proceed with development work.
```

## 🔄 Mid-Session Validation Prompt

### Use This Every 3-4 Interactions:

```markdown
REFER-IFY COMPLIANCE CHECK:

Quick validation of current work:

**Business Rule Compliance:**
- Does this maintain the referral-only model? ✅/❌
- Are role-based access controls respected? ✅/❌  
- Is this executive-grade quality? ✅/❌
- Are we following documented workflows? ✅/❌

**Technical Standards:**
- TypeScript strict typing used? ✅/❌
- Proper error handling included? ✅/❌
- Testing considerations addressed? ✅/❌
- Business rules constants referenced? ✅/❌

**Context Alignment:**
- Following [specific document]: ✅/❌
- Current priority (test coverage 43%→80%): ✅/❌
- Tool selection appropriate (UI→Cursor, Backend→Claude): ✅/❌

Any ❌ above requires immediate correction before proceeding.
```

## 🚨 Emergency Business Rule Reminder

### Use When AI Suggests Problematic Features:

```markdown
🚨 BUSINESS RULE VIOLATION DETECTED:

STOP: The suggested approach violates core Refer-ify business rules.

**Critical Reminder:**
- Refer-ify is REFERRAL-ONLY (never job board)
- Candidates CANNOT browse jobs
- NO direct applications allowed
- ALL connections through personal relationships

**Suggested approach violates:** [Specific rule]

**Correct approach:**
- Reference: businessRules.ts for platform constants
- Follow: CONTEXT_ANCHORS.md for quick rules
- Ensure: All features support referral-only model

Please revise the approach to maintain referral-only platform integrity.
```

## 🎯 Tool-Specific Validation

### For Cursor Sessions:
```markdown
CURSOR UI VALIDATION - REFER-IFY:

Before building any UI component:

**UI Must Support Referral-Only Model:**
- No "Browse Jobs" pages for candidates ✅/❌
- No "Apply Now" buttons ✅/❌
- Role-appropriate content visibility ✅/❌
- Executive-grade professional aesthetics ✅/❌

**Technical Requirements:**
- TypeScript interfaces defined ✅/❌
- Accessibility standards met ✅/❌
- Responsive design implemented ✅/❌
- Error states handled ✅/❌

Reference: .cursor/instructions.md for complete guidelines
```

### For Claude Code Sessions:
```markdown
CLAUDE CODE BACKEND VALIDATION - REFER-IFY:

Before implementing any backend logic:

**API Must Enforce Business Rules:**
- Role-based access control ✅/❌
- businessRules.ts constants used ✅/❌
- Financial calculations accurate ✅/❌
- Subscription tier validation ✅/❌

**Quality Requirements:**
- Comprehensive error handling ✅/❌
- Input validation and sanitization ✅/❌
- Database RLS policies respected ✅/❌
- Test coverage maintained/improved ✅/❌

Reference: .claude-suite/CLAUDE.md for backend patterns
```

## 📋 Session End Validation

### Use Before Completing Any Session:

```markdown
SESSION COMPLETION VALIDATION - REFER-IFY:

Before ending this session, confirm:

**Business Rule Integrity:**
✅ No job board features introduced
✅ Referral-only model maintained
✅ Role-based access preserved
✅ Executive-grade quality achieved

**Technical Quality:**
✅ TypeScript compilation successful
✅ Tests pass (where applicable)
✅ Error handling implemented
✅ Documentation updated (if needed)

**Context Preservation:**
✅ Work aligns with documented workflows
✅ Business rules constants used appropriately
✅ Next steps clearly defined for future sessions

**Hand-off Requirements:**
If transitioning to another tool:
✅ Context clearly documented
✅ Business constraints communicated
✅ Quality requirements specified

Session can be completed safely: ✅/❌
```

## 🔗 Quick Reference Links

### Always Available Context:
- **CONTEXT_ANCHORS.md** - Essential rules and current priorities
- **businessRules.ts** - Platform rule enforcement constants
- **.claude-suite/CLAUDE.md** - Complete development context
- **.cursor/instructions.md** - Cursor-specific guidelines
- **PROJECT_STATE.md** - Current development status

### Emergency Documentation:
- If AI suggests job board features → Show CONTEXT_ANCHORS.md
- If unclear about business rules → Reference businessRules.ts
- If quality standards questioned → Reference .claude-suite/CLAUDE.md
- If tool selection unclear → Reference SYSTEM_INTEGRATION.md

---

**Usage Instructions:**
1. Start every AI session with the Universal Validation Prompt
2. Use Mid-Session Validation every 3-4 interactions
3. Apply Tool-Specific Validation when switching contexts
4. Complete with Session End Validation before finishing
5. Reference Emergency Business Rule Reminder if violations detected

**Last Updated**: January 2025  
**Status**: Production Ready - Use for All AI Interactions