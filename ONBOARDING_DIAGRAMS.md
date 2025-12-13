# Onboarding System - Visual Flow Diagrams

## 🔄 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                              │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │  User Visits │
                    │  Application │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Authenticated?│
                    └──────┬───────┘
                           │
                ┌──────────┴──────────┐
                │                     │
               NO                    YES
                │                     │
                ▼                     ▼
        ┌───────────────┐    ┌──────────────────┐
        │ Redirect to   │    │ Check Onboarding │
        │ Kinde Login   │    │     Status       │
        └───────┬───────┘    └────────┬─────────┘
                │                     │
                │            ┌────────┴────────┐
                │            │                 │
                │        COMPLETE         INCOMPLETE
                │            │                 │
                │            ▼                 ▼
                │    ┌──────────────┐  ┌─────────────┐
                │    │  Dashboard   │  │ Onboarding  │
                │    │   (Access    │  │   (Resume   │
                │    │   Granted)   │  │  at Step X) │
                │    └──────────────┘  └──────┬──────┘
                │                             │
                └─────────────────────────────┘
```

---

## 📊 Onboarding Flow Detail

```
┌─────────────────────────────────────────────────────────────────┐
│                    ONBOARDING PROCESS                            │
└─────────────────────────────────────────────────────────────────┘

    STEP 1: Choose Type
    ┌──────────────────┐
    │  Individual  or  │
    │    Business      │
    └────────┬─────────┘
             │
             ├─► Save to Redis: step1
             │
             ▼
    ┌──────────────────┐
    │   STEPS 2-6:     │
    │  Form Filling    │
    └────────┬─────────┘
             │
             ├─► Each step:
             │   1. User fills form
             │   2. Client validation (Zod)
             │   3. API call: saveStep()
             │   4. Save to Redis
             │   5. Update progress
             │   6. Move to next step
             │
             ▼
    ┌──────────────────┐
    │    STEP 7:       │
    │  Final Step      │
    └────────┬─────────┘
             │
             ├─► 1. Save step 7 to Redis
             │   2. Call completeOnboarding()
             │   3. Fetch all Redis data
             │   4. Combine all steps
             │   5. Save to Database
             │   6. Delete Redis data
             │   7. Redirect to Dashboard
             │
             ▼
    ┌──────────────────┐
    │    Dashboard     │
    │   (Completed)    │
    └──────────────────┘
```

---

## 🗄️ Data Storage Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA STORAGE                                │
└─────────────────────────────────────────────────────────────────┘

    USER ACTION                REDIS                    DATABASE
    
    Step 1 Complete
         │
         ├──────────────► step1: {data}
         │                    │
         │                    ▼
         │               [Temporary]
         │
    Step 2 Complete
         │
         ├──────────────► step2: {data}
         │                    │
         │                    ▼
         │               [Temporary]
         │
    Step 3 Complete
         │
         ├──────────────► step3: {data}
         │                    │
         │                    ▼
         │               [Temporary]
         │
         ⋮                    ⋮
         │
    Step 7 Complete
         │
         ├──────────────► step7: {data}
         │                    │
         │                    ▼
         │               [All Steps]
         │                    │
         │                    │ completeOnboarding()
         │                    │
         │                    ├──► Fetch all
         │                    │
         │                    ├──► Combine
         │                    │
         │                    ├──────────────────────► User
         │                    │                        FreelancerProfile
         │                    │                        [Permanent]
         │                    │
         │                    ├──► Delete Redis
         │                    │
         │                    ▼
         │               [Cleaned Up]
         │
         ▼
    Dashboard Access
                                                       ▲
                                                       │
                                                  Read from DB
```

---

## 🔐 Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  AUTH & AUTHORIZATION                            │
└─────────────────────────────────────────────────────────────────┘

    Request to Protected Route
         │
         ▼
    ┌──────────────────┐
    │ Next.js          │
    │ Middleware       │
    │ (Kinde Auth)     │
    └────────┬─────────┘
             │
             ├─► Check Kinde Session
             │
        ┌────┴────┐
        │         │
       NO        YES
        │         │
        ▼         ▼
    [Login]  [Continue]
                  │
                  ▼
         ┌────────────────┐
         │ Page Component │
         │ (Server)       │
         └────────┬───────┘
                  │
                  ├─► checkUserOnboarding()
                  │
                  ▼
         ┌────────────────┐
         │ Check Database │
         │ onboardingDone?│
         └────────┬───────┘
                  │
             ┌────┴────┐
             │         │
            YES       NO
             │         │
             │         ├─► Check Redis
             │         │   for progress
             │         │
             ▼         ▼
        [Dashboard] [Onboarding]
                      │
                      ▼
              ┌───────────────┐
              │ ORPC Endpoint │
              │ (Auth Req'd)  │
              └───────┬───────┘
                      │
                      ├─► authed middleware
                      │   checks Kinde user
                      │
                      ▼
                 [Authorized]
```

---

## 🔄 Resume Functionality Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESUME CAPABILITY                             │
└─────────────────────────────────────────────────────────────────┘

    DAY 1: User starts onboarding
    
    ┌──────────────┐
    │   Step 1     │ ──► Redis: step1
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │   Step 2     │ ──► Redis: step2
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │   Step 3     │ ──► Redis: step3
    └──────┬───────┘
           │
           ▼
    [User leaves - closes browser]
    
    
    DAY 2: User returns
    
    ┌──────────────┐
    │  User Login  │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────┐
    │ Check Database   │
    │ onboardingDone?  │
    └──────┬───────────┘
           │
           ├─► NO
           │
           ▼
    ┌──────────────────┐
    │  Check Redis     │
    │  for progress    │
    └──────┬───────────┘
           │
           ├─► Found: step1, step2, step3
           │
           ▼
    ┌──────────────────┐
    │  Load Step 4     │
    │  (Next step)     │
    └──────┬───────────┘
           │
           ├─► Pre-fill form with
           │   data from steps 1-3
           │
           ▼
    [User continues from Step 4]
```

---

## 🎯 API Call Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      API CALLS                                   │
└─────────────────────────────────────────────────────────────────┘

    CLIENT COMPONENT
    
    ┌──────────────────┐
    │ User submits     │
    │ form (Step 2)    │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ useOnboardingAPI │
    │ .saveStep()      │
    └────────┬─────────┘
             │
             ├─► orpc.onboarding.saveStep({
             │     type: "freelancer",
             │     step: "step2",
             │     data: { ... }
             │   })
             │
             ▼
    ┌──────────────────┐
    │ ORPC Client      │
    │ (Fetch Request)  │
    └────────┬─────────┘
             │
             ├─► POST /rpc
             │   Body: { ... }
             │
             ▼
    
    SERVER
    
    ┌──────────────────┐
    │ ORPC Handler     │
    │ /rpc/[[...rest]] │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Auth Middleware  │
    │ (authed)         │
    └────────┬─────────┘
             │
             ├─► getKindeServerSession()
             │
             ├─► Extract user
             │
             ▼
    ┌──────────────────┐
    │ saveStep Handler │
    └────────┬─────────┘
             │
             ├─► Validate input (Zod)
             │
             ├─► redis.hset(
             │     `onboarding:${userId}:${type}`,
             │     { [step]: JSON.stringify(data) }
             │   )
             │
             ├─► Calculate progress
             │
             ▼
    ┌──────────────────┐
    │ Return Response  │
    │ { saved: true,   │
    │   progress: 28%} │
    └────────┬─────────┘
             │
             ▼
    
    CLIENT
    
    ┌──────────────────┐
    │ Update UI        │
    │ Show toast       │
    │ Move to next step│
    └──────────────────┘
```

---

## 🎨 Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                  COMPONENT STRUCTURE                             │
└─────────────────────────────────────────────────────────────────┘

app/onboarding/page.tsx (Server Component)
│
├─► checkUserOnboarding()
│   ├─► Check Database
│   └─► Check Redis
│
└─► <OnboardingClient> (Client Component)
    │
    ├─► useOnboardingStore()
    │   ├─► currentStep
    │   ├─► userType
    │   └─► formData
    │
    ├─► useOnboardingAPI()
    │   ├─► saveStep()
    │   └─► completeOnboarding()
    │
    ├─► <OnboardingNavbar>
    │
    ├─► <StepsSidebar>
    │   └─► Step indicators
    │
    └─► Conditional Rendering:
        │
        ├─► Step 1: Type Selection
        │   ├─► <Card>
        │   ├─► Individual Button
        │   └─► Business Button
        │
        └─► Steps 2-7:
            │
            ├─► <IndividualForm> (if individual)
            │   │
            │   ├─► useForm() + zodResolver
            │   │
            │   └─► Switch by step:
            │       ├─► <Step2PersonalInfo>
            │       ├─► <Step3AboutYou>
            │       ├─► <Step4Goals>
            │       ├─► <Step5Skills>
            │       ├─► <Step6Experience>
            │       └─► <Step7Bio>
            │
            └─► <BusinessForm> (if business)
                │
                ├─► useForm() + zodResolver
                │
                └─► Switch by step:
                    ├─► <Step2CompanyInfo>
                    ├─► <Step3IndustryType>
                    ├─► <Step4CompanyDetails>
                    ├─► <Step5Goals>
                    ├─► <Step6Budget>
                    └─► <Step7Contact>
```

---

## 🔍 State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                              │
└─────────────────────────────────────────────────────────────────┘

    ZUSTAND STORE (Client-Side)
    
    ┌──────────────────────────────────┐
    │ useOnboardingStore               │
    ├──────────────────────────────────┤
    │ State:                           │
    │  • currentStep: number           │
    │  • userType: string | null       │
    │  • formData: object              │
    │  • completedSteps: number[]      │
    ├──────────────────────────────────┤
    │ Actions:                         │
    │  • setCurrentStep()              │
    │  • setUserType()                 │
    │  • updateFormData()              │
    │  • nextStep()                    │
    │  • previousStep()                │
    │  • initializeFromServer()        │
    └──────────────────────────────────┘
             ▲                 │
             │                 │
             │                 ▼
    ┌────────┴─────────────────────────┐
    │                                  │
    │  Component reads/writes state    │
    │                                  │
    └──────────────────────────────────┘
    
    
    SERVER STATE (Database + Redis)
    
    ┌──────────────────────────────────┐
    │ PostgreSQL                       │
    ├──────────────────────────────────┤
    │ • User                           │
    │ • FreelancerProfile              │
    │ • CompanyProfile                 │
    │   - onboardingDone: boolean      │
    │   - onboardingData: json         │
    └──────────────────────────────────┘
    
    ┌──────────────────────────────────┐
    │ Redis (Upstash)                  │
    ├──────────────────────────────────┤
    │ Key: onboarding:{id}:{type}      │
    │ Type: Hash                       │
    │ Fields:                          │
    │  • step1: json                   │
    │  • step2: json                   │
    │  • ...                           │
    └──────────────────────────────────┘
```

---

These diagrams provide a visual understanding of how the entire onboarding system works together!
