# Onboarding System Architecture

## Overview

This onboarding system provides a robust, scalable solution for user onboarding with Redis-based temporary storage and PostgreSQL persistence. It supports both individual (freelancer) and business (company) user types with a 7-step onboarding flow.

## Key Features

✅ **Authentication-First**: Kinde Auth integration with middleware protection  
✅ **Progressive Saving**: Each step automatically saves to Redis  
✅ **Resume Capability**: Users can leave and resume from where they left off  
✅ **Type-Safe**: Full TypeScript with Zod validation  
✅ **Performance**: Redis for fast temporary storage, database for persistence  
✅ **Automatic Redirects**: Smart routing based on onboarding status  

---

## Architecture Flow

```
┌─────────────────┐
│  User Login     │
│  (Kinde Auth)   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Check Onboarding Status    │
│  (Database + Redis)         │
└────────┬────────────────────┘
         │
         ├──► Complete? ──────► Dashboard
         │
         ├──► In Progress? ───► Resume at Step X
         │
         └──► New User? ───────► Start Onboarding
                                 │
                                 ▼
                        ┌────────────────┐
                        │  Step 1-6:     │
                        │  Save to Redis │
                        └────────┬───────┘
                                 │
                                 ▼
                        ┌────────────────┐
                        │  Step 7:       │
                        │  Complete      │
                        │  • Move Redis  │
                        │    → Database  │
                        │  • Delete Redis│
                        │  • Redirect    │
                        └────────────────┘
```

---

## File Structure

```
app/
├── onboarding/
│   ├── page.tsx                    # Server component - checks auth & status
│   └── _components/
│       ├── OnboardingClient.tsx    # Client component - handles UI & API
│       ├── IndividualForm.tsx      # Form for freelancers
│       ├── BusinessForm.tsx        # Form for companies
│       └── steps/
│           ├── individual/         # Individual step components
│           └── business/           # Business step components
│
├── dashboard/
│   └── page.tsx                    # Requires completed onboarding
│
├── router/
│   └── onboarding/
│       ├── checkOnboarding.ts      # Check onboarding status (ORPC)
│       ├── saveStepData.ts         # Save step to Redis (ORPC)
│       ├── getProgress.ts          # Get progress from Redis (ORPC)
│       └── completeOnboarding.ts   # Move Redis → DB (ORPC)
│
├── middlewares/
│   └── auth.ts                     # ORPC auth middleware
│
lib/
├── onboarding.ts                   # Server-side utilities
├── orpc.ts                         # Client ORPC setup
├── orpc.server.ts                  # Server ORPC setup
├── redis.ts                        # Upstash Redis client
└── prisma.ts                       # Prisma client

hooks/
└── useOnboardingAPI.ts             # Client hook for API calls

middleware.ts                       # Next.js middleware (Kinde Auth)
```

---

## Data Flow

### 1. **User Authentication**
- Kinde handles authentication
- Middleware protects all routes except public paths
- User info available via `getKindeServerSession()`

### 2. **Onboarding Check (Server-Side)**
```typescript
// In page.tsx
const status = await checkUserOnboarding();
// Returns: { isComplete, userType, currentStep, redisData }
```

**Checks:**
1. Database: Is `onboardingDone = true`?
2. Redis: Any in-progress data?
3. Determines where to redirect user

### 3. **Step Saving (Client-Side)**
```typescript
// User completes a step
await saveStep("freelancer", "step2", { firstName: "John", ... });
```

**Process:**
- Validates data with Zod schema
- Saves to Redis: `onboarding:{userId}:{type}` hash
- Key: `step2`, Value: JSON stringified data
- Returns progress percentage

### 4. **Completion (Client-Side)**
```typescript
// User completes step 7
await completeOnboarding("freelancer");
```

**Process:**
1. Fetches all steps from Redis
2. Combines into single object
3. Creates/updates database records:
   - `User` table
   - `FreelancerProfile` or `CompanyProfile`
4. Deletes Redis data
5. Redirects to dashboard

---

## Redis Structure

```
Key: onboarding:{userId}:freelancer
Type: Hash

Fields:
  step1: '{"userType":"individual"}'
  step2: '{"firstName":"John","lastName":"Doe",...}'
  step3: '{"age":"25-34","location":"NYC",...}'
  step4: '{"primaryGoal":"growth",...}'
  step5: '{"skillLevel":"intermediate",...}'
  step6: '{"experience":"3-5",...}'
  step7: '{"bio":"...",...}'
```

**TTL**: No expiration (manual cleanup on completion)

---

## Database Schema

### User Table
```prisma
model User {
  id                String
  email             String
  fullName          String
  type              VendorType  // FREELANCER | COMPANY
  
  freelancerProfile FreelancerProfile?
  companyProfile    CompanyProfile?
}
```

### FreelancerProfile Table
```prisma
model FreelancerProfile {
  id                String
  userId            String
  title             String
  description       String?
  
  onboardingStep    Int       @default(1)
  onboardingData    Json?     // Full onboarding data
  onboardingDone    Boolean   @default(false)
  
  // ... other fields
}
```

### CompanyProfile Table
```prisma
model CompanyProfile {
  id                String
  userId            String
  name              String
  description       String?
  
  onboardingStep    Int       @default(1)
  onboardingData    Json?     // Full onboarding data
  onboardingDone    Boolean   @default(false)
  
  // ... other fields
}
```

---

## API Endpoints (ORPC)

### 1. `checkOnboarding`
**Auth**: Required  
**Input**: None  
**Output**:
```typescript
{
  isComplete: boolean;
  userType: "freelancer" | "company" | null;
  currentStep: number;
  hasRedisData: boolean;
  redisType: "freelancer" | "company" | null;
}
```

### 2. `saveStep`
**Auth**: Required  
**Input**:
```typescript
{
  type: "freelancer" | "company";
  step: string;  // e.g., "step2"
  data: Record<string, any>;
}
```
**Output**:
```typescript
{
  saved: boolean;
  progress: number;
  completedSteps: number;
  totalSteps: number;
}
```

### 3. `getProgress`
**Auth**: Required  
**Input**:
```typescript
{
  type: "freelancer" | "company";
}
```
**Output**:
```typescript
{
  progress: number;
  completedSteps: number;
  totalSteps: number;
  data?: Record<string, any>;
}
```

### 4. `completeOnboarding`
**Auth**: Required  
**Input**:
```typescript
{
  type: "freelancer" | "company";
}
```
**Output**:
```typescript
{
  success: boolean;
  profileId: string;
}
```

---

## Usage Examples

### Server Component (Dashboard)
```typescript
import { requireOnboarding } from "@/lib/onboarding";

export default async function DashboardPage() {
  // Automatically redirects if onboarding incomplete
  const status = await requireOnboarding();
  
  return <div>Welcome {status.userType}!</div>;
}
```

### Client Component (Onboarding)
```typescript
"use client";
import { useOnboardingAPI } from "@/hooks/useOnboardingAPI";

export default function OnboardingForm() {
  const { saveStep, isSaving } = useOnboardingAPI();
  
  const handleSubmit = async (data) => {
    await saveStep("freelancer", "step2", data);
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Best Practices

### ✅ DO:
- Use server components for auth checks
- Save each step to Redis immediately
- Validate data with Zod schemas
- Handle errors gracefully with toast notifications
- Use loading states during API calls

### ❌ DON'T:
- Skip Redis - it enables resume functionality
- Store sensitive data in Redis without encryption
- Allow unauthenticated access to onboarding
- Forget to clean up Redis after completion

---

## Performance Optimizations

1. **Dynamic Imports**: Use Next.js dynamic imports for step components
2. **Redis Caching**: Fast temporary storage with Upstash
3. **Prisma Accelerate**: Database query caching
4. **Server Components**: Reduce client-side JavaScript
5. **Parallel Queries**: Use `Promise.all()` for Redis checks

---

## Error Handling

### Client-Side
```typescript
try {
  await saveStep(type, step, data);
  toast.success("Progress saved!");
} catch (error) {
  toast.error("Failed to save. Please try again.");
  console.error(error);
}
```

### Server-Side
```typescript
if (!stepData || Object.keys(stepData).length === 0) {
  throw new ORPCError("PRECONDITION_FAILED", {
    message: "No onboarding data found"
  });
}
```

---

## Testing Checklist

- [ ] New user starts onboarding
- [ ] User completes all steps
- [ ] User leaves mid-onboarding and resumes
- [ ] Completed user redirects to dashboard
- [ ] Incomplete user redirects to onboarding
- [ ] Redis data cleans up after completion
- [ ] Database records created correctly
- [ ] Both freelancer and company flows work

---

## Environment Variables

```env
# Kinde Auth
KINDE_CLIENT_ID=
KINDE_CLIENT_SECRET=
KINDE_ISSUER_URL=
KINDE_SITE_URL=
KINDE_POST_LOGOUT_REDIRECT_URL=
KINDE_POST_LOGIN_REDIRECT_URL=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Database
DATABASE_URL=
DIRECT_URL=
```

---

## Future Enhancements

1. **Analytics**: Track drop-off rates per step
2. **A/B Testing**: Test different onboarding flows
3. **Email Reminders**: Nudge users to complete onboarding
4. **Progress Bar**: Visual progress indicator
5. **Skip Steps**: Allow optional steps
6. **Multi-language**: i18n support

---

## Troubleshooting

### User stuck in onboarding loop
**Solution**: Check Redis data and database `onboardingDone` flag

### Redis data not saving
**Solution**: Verify Upstash credentials and network connectivity

### Type errors with Prisma
**Solution**: Regenerate Prisma client: `npx prisma generate`

### Middleware not protecting routes
**Solution**: Check `middleware.ts` matcher configuration

---

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in console
3. Verify environment variables
4. Test with a fresh user account
