# Project Restructuring Plan

## Overview
This document tracks the restructuring of the ai-saas project to improve scalability, maintainability, and debuggability.

## Goals
1. **Feature-based organization** - Group related code by feature
2. **Clear separation of concerns** - Separate client, server, and shared code
3. **Improved discoverability** - Make it easy to find related files
4. **Better scalability** - Support growth without becoming unwieldy

## Directory Structure Changes

### Phase 1: Create New Structure
✅ Created feature directories
✅ Created server directories
✅ Created organized component directories

### Phase 2: Move Files (In Progress)

#### Server-Side Code

**API Routers (oRPC/tRPC)**
- `app/router/onboarding/` → `src/server/api/routers/onboarding/`
  - `checkOnboarding.ts`
  - `completeOnboarding.ts`
  - `getProgress.ts`
  - `saveStepData.ts`
- `app/router/index.ts` → `src/server/api/index.ts`
- `app/rpc/[[...rest]]/route.ts` → `app/api/rpc/[[...rest]]/route.ts`

**Middlewares**
- `app/middlewares/auth.ts` → `src/server/api/middlewares/auth.ts`
- `middleware.ts` → Keep at root (Next.js requirement)

**Database & External Services**
- `lib/prisma.ts` → `src/server/db/client.ts`
- `lib/redis.ts` → `src/server/db/redis.ts`
- `lib/orpc.server.ts` → `src/server/api/orpc.server.ts`

**Business Logic/Services**
- `lib/onboarding.ts` → `src/server/services/onboarding/index.ts`
- `lib/vendorType.ts` → `src/server/services/vendor/vendorType.ts`

#### Client-Side Code

**Feature: Onboarding**
- `app/onboarding/_components/` → `src/features/onboarding/components/`
  - `BusinessForm.tsx`
  - `IndividualForm.tsx`
  - `OnBoardingNavbar.tsx`
  - `OnboardingClient.tsx`
  - `StepsSidebar.tsx`
- `store/onboardingStore.ts` → `src/features/onboarding/stores/onboarding-store.ts`
- `hooks/useOnboardingAPI.ts` → `src/features/onboarding/hooks/use-onboarding-api.ts`

**Feature: Dashboard**
- `app/dashboard/_components/` → `src/features/dashboard/components/`
  - `app-sidebar.tsx`
  - `dashboard-layout.tsx`
  - `overview-section.tsx`
  - `stats-chart.tsx`
- `store/vendor-store.ts` → `src/features/dashboard/stores/vendor-store.ts`

**Feature: Notifications**
- `app/dashboard/_components/notification-modal.tsx` → `src/features/notifications/components/notification-modal.tsx`
- `store/notification-store.tsx` → `src/features/notifications/stores/notification-store.ts`

**Feature: Analytics**
- `app/dashboard/analytics/` → Keep in app directory (it's a route)
- Create `src/features/analytics/` for analytics-specific components/logic

#### Shared Code

**UI Components**
- `components/ui/` → Keep as is (shadcn/ui convention)
- `components/ui/AuthProvider.tsx` → `src/components/providers/auth-provider.tsx`

**Utilities**
- `lib/utils.ts` → `src/lib/utils.ts`
- `lib/orpc.ts` → `src/lib/orpc.ts`
- `lib/theme-provider.tsx` → `src/components/providers/theme-provider.tsx`
- `utils/supabase/` → `src/lib/supabase/`

**Hooks**
- `hooks/use-mobile.ts` → `src/hooks/use-mobile.ts`

**Types**
- `app/generated/` → `src/types/generated/`

#### App Directory (Routes)

**Marketing Pages**
- `app/(landing)/` → Keep structure, just clean up

**Dashboard Routes**
- `app/dashboard/` → Keep routes, move components to features

**Onboarding Routes**
- `app/onboarding/` → Keep routes, move components to features

### Phase 3: Update Imports
- Update all import paths to reflect new structure
- Update tsconfig.json path aliases if needed

### Phase 4: Update Configuration
- Update `.gitignore` if needed
- Update `next.config.ts` if needed
- Update any build scripts

### Phase 5: Testing & Validation
- Verify all imports resolve correctly
- Test build process
- Test development server
- Verify no broken references

## Benefits of New Structure

### 1. Feature Isolation
Each feature has its own:
- Components
- Hooks
- Stores
- Types
- Schemas

### 2. Clear Server/Client Separation
- `src/server/` - All server-only code
- `src/features/` - Feature-specific client code
- `src/components/` - Shared client components
- `src/lib/` - Shared utilities (isomorphic)

### 3. Scalability
- Easy to add new features
- Easy to find related code
- Easy to delete features
- Clear ownership boundaries

### 4. Better Developer Experience
- Faster file navigation
- Clearer mental model
- Easier onboarding for new developers
- Better IDE autocomplete

## Migration Notes

### Import Path Changes
All imports will need to be updated. Common patterns:

**Before:**
```typescript
import { useOnboardingAPI } from '@/hooks/useOnboardingAPI'
import { useNotificationStore } from '@/store/notification-store'
import { DashboardLayout } from '@/app/dashboard/_components/dashboard-layout'
```

**After:**
```typescript
import { useOnboardingAPI } from '@/features/onboarding/hooks/use-onboarding-api'
import { useNotificationStore } from '@/features/notifications/stores/notification-store'
import { DashboardLayout } from '@/features/dashboard/components/dashboard-layout'
```

### Path Aliases (tsconfig.json)
Consider adding these aliases:
```json
{
  "@/features/*": ["src/features/*"],
  "@/server/*": ["src/server/*"],
  "@/components/*": ["src/components/*"],
  "@/lib/*": ["src/lib/*"],
  "@/hooks/*": ["src/hooks/*"],
  "@/types/*": ["src/types/*"]
}
```

## Status
- [ ] Phase 1: Create Structure ✅
- [ ] Phase 2: Move Files (In Progress)
- [ ] Phase 3: Update Imports
- [ ] Phase 4: Update Configuration
- [ ] Phase 5: Testing & Validation
