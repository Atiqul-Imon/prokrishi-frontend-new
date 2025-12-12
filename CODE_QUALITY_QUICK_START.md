# Code Quality Quick Start Guide

## 🚀 Start Here - Top 3 Priorities

### 1. Fix TypeScript Errors (30 minutes)
**Why First:** Blocks proper type checking, affects IDE support

```bash
# Check current errors
npm run type-check

# Fix: Add to jest.setup.js or __tests__/setup.ts
import '@testing-library/jest-dom'
```

**Files to Fix:**
- `app/__tests__/cart.test.tsx` - Add proper Jest matcher types
- `components/__tests__/ProductCard.test.tsx` - Add proper Jest matcher types
- `jest.setup.js` - Import `@testing-library/jest-dom`

---

### 2. Set Up ESLint (1 hour)
**Why Second:** Catches bugs early, enforces code standards

```bash
# Check if ESLint config exists
ls -la | grep eslint

# Create .eslintrc.json if missing
```

**Quick Setup:**
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

---

### 3. Replace `any` Types in API Layer (2-3 hours)
**Why Third:** API layer is critical, affects entire app

**Start with:** `app/utils/api.ts` (35 instances of `any`)

**Strategy:**
1. Create proper error types
2. Type all API response handlers
3. Type FormData helpers
4. Use `unknown` instead of `any` where types are truly unknown

---

## 📊 Current Issues Summary

| Issue | Count | Priority | Estimated Time |
|-------|-------|----------|----------------|
| TypeScript Errors | 10 | 🔴 Critical | 30 min |
| ESLint Not Configured | 1 | 🔴 Critical | 1 hour |
| `any` Types | 135 | 🔴 Critical | 2-3 days |
| Console Statements | 27 | 🟡 High | 2 hours |
| React Hooks Optimization | 268 hooks | 🟡 High | 3-4 days |
| Error Handling | Multiple | 🟡 High | 1-2 days |

---

## 🎯 Recommended First Week Plan

### Day 1-2: Foundation
- [ ] Fix TypeScript errors (30 min)
- [ ] Set up ESLint (1 hour)
- [ ] Run lint and fix critical issues (2-3 hours)

### Day 3-5: Type Safety
- [ ] Fix `any` types in `app/utils/api.ts` (4-6 hours)
- [ ] Fix `any` types in `app/context/*.tsx` (2-3 hours)
- [ ] Fix `any` types in critical pages (checkout, products) (4-6 hours)

### Day 6-7: Cleanup
- [ ] Replace console statements (2 hours)
- [ ] Review and fix ESLint warnings (2-3 hours)
- [ ] Test all changes thoroughly (2-3 hours)

---

## 🔍 Quick Checks

### Check TypeScript Errors
```bash
npm run type-check
```

### Check Lint Errors
```bash
npm run lint
```

### Find All `any` Types
```bash
grep -r ": any" app/ --include="*.ts" --include="*.tsx" | wc -l
```

### Find Console Statements
```bash
grep -r "console\." app/ --include="*.ts" --include="*.tsx" | wc -l
```

---

## 📝 Next Steps After Quick Start

Once you've completed the top 3 priorities, move to:
1. **Error Handling** - Add error boundaries and proper error handling
2. **React Hooks Optimization** - Optimize useEffect and useState usage
3. **Code Organization** - Extract reusable components

See `CODE_QUALITY_IMPROVEMENT_PLAN.md` for the complete plan.

---

**Remember:** 
- Fix incrementally
- Test after each change
- Commit frequently
- Don't try to fix everything at once

