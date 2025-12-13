# Onboarding System - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- ✅ Kinde Auth configured
- ✅ Upstash Redis configured
- ✅ PostgreSQL database configured
- ✅ Prisma schema migrated

### Installation

No additional packages needed! The system uses your existing setup:
- `@kinde-oss/kinde-auth-nextjs`
- `@upstash/redis`
- `@orpc/server` & `@orpc/client`
- `@prisma/client`
- `zod`
- `react-hook-form`
- `sonner` (for toast notifications)

---

## 📝 Step-by-Step Setup

### 1. Verify Environment Variables

```env
# Kinde Auth
KINDE_CLIENT_ID=your_client_id
KINDE_CLIENT_SECRET=your_secret
KINDE_ISSUER_URL=https://your-domain.kinde.com
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000
KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/dashboard

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# Database
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_url
```

### 2. Run Database Migration

```bash
npx prisma generate
npx prisma db push
```

### 3. Add Toaster to Root Layout

```tsx
// app/layout.tsx
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
```

### 4. Test the Flow

1. **Start the dev server**
   ```bash
   npm run dev
   ```

2. **Login as a new user**
   - Go to `/api/auth/login`
   - Complete Kinde authentication
   - You'll be redirected to onboarding

3. **Complete onboarding**
   - Choose Individual or Business
   - Fill out all 7 steps
   - Get redirected to dashboard

4. **Test resume functionality**
   - Start onboarding
   - Complete 2-3 steps
   - Close browser
   - Login again
   - Should resume at step 4

---

## 🎯 Usage Examples

### Protect a Route (Require Completed Onboarding)

```typescript
// app/dashboard/page.tsx
import { requireOnboarding } from "@/lib/onboarding";

export default async function DashboardPage() {
  const status = await requireOnboarding();
  
  return (
    <div>
      <h1>Welcome, {status.userType}!</h1>
    </div>
  );
}
```

### Check Onboarding Status

```typescript
// app/profile/page.tsx
import { checkUserOnboarding } from "@/lib/onboarding";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const status = await checkUserOnboarding();
  
  if (!status) {
    redirect("/api/auth/login");
  }
  
  if (!status.isComplete) {
    // Show limited profile or redirect
    return <div>Please complete onboarding first</div>;
  }
  
  return <FullProfile />;
}
```

### Use Onboarding API in Client Component

```typescript
"use client";
import { useOnboardingAPI } from "@/hooks/useOnboardingAPI";

export default function CustomOnboardingStep() {
  const { saveStep, isSaving } = useOnboardingAPI();
  
  const handleSave = async () => {
    await saveStep("freelancer", "customStep", {
      customField: "value"
    });
  };
  
  return (
    <button onClick={handleSave} disabled={isSaving}>
      {isSaving ? "Saving..." : "Save Progress"}
    </button>
  );
}
```

---

## 🔧 Customization

### Add a New Step

1. **Create step component**
   ```tsx
   // app/onboarding/_components/steps/individual/Step8Custom.tsx
   export const Step8Custom = ({ register, errors }) => {
     return (
       <>
         <h2>Custom Step</h2>
         <input {...register("customField")} />
       </>
     );
   };
   ```

2. **Add schema**
   ```typescript
   // In IndividualForm.tsx
   const step8Schema = z.object({
     customField: z.string().min(1, "Required"),
   });
   ```

3. **Update form**
   ```typescript
   const getSchema = () => {
     switch (currentStep) {
       // ... existing cases
       case 8: return step8Schema;
       default: return z.record(z.string(), z.any());
     }
   };
   
   const renderStepContent = () => {
     switch (currentStep) {
       // ... existing cases
       case 8: return <Step8Custom {...commonProps} />;
       default: return null;
     }
   };
   ```

4. **Update total steps**
   ```typescript
   const totalSteps = 8; // Was 7
   ```

### Customize Step Labels

```tsx
// app/onboarding/_components/StepsSidebar.tsx
const steps = {
  individual: [
    { number: 1, label: "Your Custom Label" },
    { number: 2, label: "Personal Info" },
    // ... rest
  ],
  business: [
    // ... business steps
  ]
};
```

### Change Redirect After Completion

```typescript
// hooks/useOnboardingAPI.ts
const completeOnboarding = async (type) => {
  // ...
  if (result.success) {
    toast.success("Onboarding completed!");
    router.push("/custom-redirect"); // Change this
    router.refresh();
  }
  // ...
};
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@/lib/orpc'"
**Solution**: Make sure you have `lib/orpc.ts` and `lib/orpc.server.ts` files

### Issue: Toast notifications not showing
**Solution**: Add `<Toaster />` to your root layout

### Issue: Redirecting to login instead of onboarding
**Solution**: Check Kinde `KINDE_POST_LOGIN_REDIRECT_URL` is set correctly

### Issue: Redis connection errors
**Solution**: Verify Upstash credentials in `.env`

### Issue: Type errors with Prisma
**Solution**: Run `npx prisma generate` to regenerate types

### Issue: User stuck in onboarding loop
**Solution**: 
```bash
# Clear Redis data for a user
# In Upstash dashboard or CLI:
DEL onboarding:{userId}:freelancer
DEL onboarding:{userId}:company
```

---

## 📊 Monitoring

### Check Redis Data

```typescript
// In a server action or API route
import { redis } from "@/lib/redis";

const userId = "kinde_user_id";
const data = await redis.hgetall(`onboarding:${userId}:freelancer`);
console.log(data);
```

### Check Database Status

```typescript
import prisma from "@/lib/prisma";

const user = await (prisma as any).user.findUnique({
  where: { id: "kinde_user_id" },
  include: {
    freelancerProfile: true,
    companyProfile: true,
  },
});

console.log(user?.freelancerProfile?.onboardingDone);
```

### View All Onboarding Keys in Redis

```bash
# In Upstash CLI or dashboard
KEYS onboarding:*
```

---

## 🎨 Styling Tips

### Add Loading States

```tsx
// In OnboardingClient.tsx
{isSaving && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg">
      <p>Saving your progress...</p>
    </div>
  </div>
)}
```

### Add Progress Bar

```tsx
// In OnboardingClient.tsx
<div className="w-full bg-gray-200 h-2 rounded-full">
  <div 
    className="bg-primary h-2 rounded-full transition-all"
    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
  />
</div>
```

### Add Step Validation Indicators

```tsx
// In StepsSidebar.tsx
{completedSteps.includes(step.number) && (
  <CheckCircle className="w-4 h-4 text-green-500" />
)}
```

---

## 🚀 Performance Tips

1. **Use Dynamic Imports**
   ```typescript
   const Step2 = dynamic(() => import('./steps/Step2'));
   ```

2. **Debounce Auto-Save**
   ```typescript
   const debouncedSave = useDebouncedCallback(
     (data) => saveStep(type, step, data),
     1000
   );
   ```

3. **Prefetch Dashboard**
   ```typescript
   import { useRouter } from "next/navigation";
   
   const router = useRouter();
   useEffect(() => {
     if (currentStep === 6) {
       router.prefetch("/dashboard");
     }
   }, [currentStep]);
   ```

---

## 📚 Additional Resources

- [Full Architecture Documentation](./ONBOARDING_ARCHITECTURE.md)
- [Implementation Details](./ONBOARDING_IMPLEMENTATION.md)
- [Kinde Auth Docs](https://kinde.com/docs)
- [Upstash Redis Docs](https://docs.upstash.com/redis)
- [ORPC Docs](https://orpc.dev)

---

## ✅ Checklist

Before deploying to production:

- [ ] All environment variables set
- [ ] Database migrated
- [ ] Redis connection tested
- [ ] Kinde auth configured
- [ ] Toaster added to layout
- [ ] All 7 steps working
- [ ] Resume functionality tested
- [ ] Dashboard protection working
- [ ] Error handling tested
- [ ] Loading states added
- [ ] Mobile responsive
- [ ] Analytics tracking added (optional)

---

## 🎉 You're Ready!

Your onboarding system is now fully configured and ready to use. Test it thoroughly and customize it to match your brand and requirements.

For questions or issues, refer to the troubleshooting section or check the full documentation.

Happy coding! 🚀
