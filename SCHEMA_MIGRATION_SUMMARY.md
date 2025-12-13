# Schema Migration Summary

## Date: 2025-12-13

### Schema Changes (prisma/schema.prisma)

The schema has been significantly refactored with the following major changes:

#### **Enums Added/Modified:**
1. ✅ **VendorType** - Remains: `INDIVIDUAL`, `BUSINESS`
2. ✅ **IntakeType** - NEW: `RFP`, `RFQ`
3. ✅ **ProposalStatus** - MODIFIED: Added `FINAL`, removed `ARCHIVED`
4. ✅ **KnowledgeType** - NEW: `PROJECT`, `DOCUMENT`, `PROPOSAL`, `SERVICE`
5. ✅ **OnboardingStatus** - NEW: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`
6. ❌ **Industry** - REMOVED
7. ❌ **UserRole** - REMOVED
8. ❌ **RfqSource** - REMOVED

#### **Model Changes:**

##### User Model:
- ✅ Field renamed: `type` → `vendorType`
- ✅ Field renamed: `fullName` → `name` (nullable)
- ✅ Added onboarding fields at account level:
  - `onboardingStatus` (OnboardingStatus, default: NOT_STARTED)
  - `onboardingStep` (Int, default: 0)
  - `onboardingData` (Json?)

##### FreelancerProfile Model:
- ✅ Field changed: `onboardingDone` (boolean) → `onboardingStatus` (OnboardingStatus, default: IN_PROGRESS)
- ✅ Field renamed: `description` → `bio`
- ❌ Removed fields: `portfolioUrl`, `linkedInUrl`, `industry`, and other social media fields
- ✅ Kept: `onboardingStep`, `onboardingData`

##### CompanyProfile Model:
- ✅ Field changed: `onboardingDone` (boolean) → `onboardingStatus` (OnboardingStatus, default: IN_PROGRESS)
- ✅ Kept: `onboardingStep`, `onboardingData`
- ❌ Removed fields: social media URLs

##### Knowledge Base Models:
- ✅ `Document` → `VendorDocument` (renamed)
  - Added `type` field (KnowledgeType)
  - Changed `content` → `rawText`
  - Changed `vector` → `embedding`

##### Intake (formerly RFP/RFQ):
- ✅ `RFP` → `IntakeDocument` (renamed)
  - Added `type` field (IntakeType: RFP or RFQ)
  - Unified RFP and RFQ into single model
- ✅ `RFPSection` → `IntakeSection` (renamed)
- ✅ `RFPEmbedding` → `IntakeEmbedding` (renamed)
  - Changed `vector` → `vector` (kept, but is Bytes type)
- ❌ `RFQ` model - REMOVED (merged into IntakeDocument)

##### Proposal Models:
- ✅ Added `AIGeneration` model for tracking AI generations

---

## Code Changes Made

### ✅ Files Updated:

1. **prisma/schema.prisma**
   - Already updated by user with new schema structure

2. **src/server/db/client.ts**
   - No changes needed (already pointing to correct generated location)

3. **src/server/api/routers/onboarding/checkOnboarding.ts**
   - Changed `onboardingDone` → `onboardingStatus === "COMPLETED"`

4. **src/server/api/routers/onboarding/completeOnboarding.ts**
   - Changed `onboardingDone: true` → `onboardingStatus: "COMPLETED"`
   - Changed `description` → `bio` (FreelancerProfile)
   - Removed invalid fields: `portfolioUrl`, `linkedInUrl`, `industry`
   - Changed `type` → `vendorType` in User model
   - Changed `fullName` → `name` in User model

5. **src/server/services/vendor/vendor-type.ts**
   - Changed database query from `select: { type: true }` → `select: { vendorType: true }`
   - Changed return from `vendorType?.type` → `vendorData?.vendorType?.toLowerCase()`

### ✅ Prisma Client Regenerated:
- Generated at: `app/generated/prisma/`
- All type definitions updated to match new schema

---

## Migration Checklist

- ✅ Schema updated with new structure
- ✅ Prisma client regenerated (`npx prisma generate`)
- ✅ Onboarding routers updated to use new fields
- ✅ Vendor type service updated
- ✅ TypeScript compilation successful (`npx tsc --noEmit`)
- ⚠️ Database migration NOT run yet - **User needs to run: `npx prisma migrate dev`**
- ⚠️ Existing data migration strategy needed for production

---

## Next Steps Required

### 🚨 **IMPORTANT - Database Migration:**

Before deploying to production, you MUST:

1. **Create and run migration:**
   ```bash
   npx prisma migrate dev --name schema_refactor
   ```

2. **Data Migration Script Needed:**
   Since field names changed, you need to migrate existing data:
   - `User.type` → `User.vendorType`
   - `User.fullName` → `User.name`
   - `FreelancerProfile.onboardingDone` → `FreelancerProfile.onboardingStatus`
   - `CompanyProfile.onboardingDone` → `CompanyProfile.onboardingStatus`

   Example migration SQL:
   ```sql
   -- Update User table
   UPDATE "User" SET "vendorType" = "type";
   UPDATE "User" SET "name" = "fullName";
   
   -- Update FreelancerProfile
   UPDATE "FreelancerProfile" 
   SET "onboardingStatus" = CASE 
     WHEN "onboardingDone" = true THEN 'COMPLETED'::\"OnboardingStatus\"
     ELSE 'IN_PROGRESS'::\"OnboardingStatus\"
   END;
   
   -- Update CompanyProfile
   UPDATE "CompanyProfile" 
   SET "onboardingStatus" = CASE 
     WHEN "onboardingDone" = true THEN 'COMPLETED'::\"OnboardingStatus\"
     ELSE 'IN_PROGRESS'::\"OnboardingStatus\"
   END;
   ```

3. **Test thoroughly:**
   - Test onboarding flow
   - Test vendor type detection
   - Test all CRUD operations on affected models

---

## Files That May Need Attention

The following files use vendor/onboarding related logic and should be reviewed:

1. `src/features/dashboard/stores/vendor-store.ts` - Uses vendorType (lowercase 'individual'/'business')
2. `src/features/dashboard/components/overview-section.tsx` - Vendor type conditionals
3. `src/features/dashboard/components/dashboard-layout.tsx` - Vendor type checks
4. `src/features/dashboard/components/app-sidebar.tsx` - Vendor type display

These files currently expect lowercase 'individual'/'business' strings, which matches the updated `vendor-type.ts` service that now returns lowercased values.

---

## Summary

✅ **All code has been updated to match the new schema**
✅ **TypeScript compilation passes with no errors**
⚠️ **Database migration needs to be run**
⚠️ **Existing data needs to be migrated**

The project is now ready for database migration and testing.
