import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { redis } from "@/server/db/redis";
import prisma from "@/server/db/client";

export async function checkUserOnboarding() {
  const { getUser } = await getKindeServerSession();
  const kindeUser = await getUser();

  if (!kindeUser) {
    return null;
  }

  // Check database for completed onboarding
  const user = await (prisma as any).user.findUnique({
    where: { id: kindeUser.id },
    include: {
      freelancerProfile: true,
      companyProfile: true,
    },
  });

  // If onboarding is complete, return user data
  if (user?.freelancerProfile?.onboardingDone) {
    return {
      isComplete: true,
      userType: "individual" as const,
      currentStep: 7,
      user,
    };
  }

  if (user?.companyProfile?.onboardingDone) {
    return {
      isComplete: true,
      userType: "business" as const,
      currentStep: 7,
      user,
    };
  }

  // Check Redis for in-progress onboarding
  const freelancerKey = `onboarding:${kindeUser.id}:individual`;
  const companyKey = `onboarding:${kindeUser.id}:business`;

  const [freelancerData, companyData] = await Promise.all([
    redis.hgetall(freelancerKey),
    redis.hgetall(companyKey),
  ]);

  const freelancerSteps = freelancerData ? Object.keys(freelancerData).length : 0;
  const companySteps = companyData ? Object.keys(companyData).length : 0;

  // Determine which type has more progress
  if (freelancerSteps > 0 || companySteps > 0) {
    const type = freelancerSteps >= companySteps ? "individual" : "business";
    const currentStep = Math.max(freelancerSteps, companySteps) + 1;
    const data = type === "individual" ? freelancerData : companyData;

    // Parse Redis data
    const parsedData = data
      ? Object.fromEntries(
          Object.entries(data).map(([k, v]) => {
            if (typeof v === 'string') {
              try {
                return [k, JSON.parse(v)];
              } catch (e) {
                console.error(`Failed to parse Redis data for key ${k}:`, v);
                return [k, v]; // Return as-is if parsing fails
              }
            }
            return [k, v];
          })
        )
      : {};

    return {
      isComplete: false,
      userType: type,
      currentStep: Math.min(currentStep, 7),
      redisData: parsedData,
      user,
    };
  }

  // New user - no onboarding data
  return {
    isComplete: false,
    userType: null,
    currentStep: 1,
    redisData: {},
    user,
  };
}

export async function requireOnboarding() {
  const status = await checkUserOnboarding();
  
  if (!status) {
    redirect("/api/auth/login");
  }

  if (!status.isComplete) {
    redirect("/onboarding");
  }

  return status;
}

export async function requireNoOnboarding() {
  const status = await checkUserOnboarding();
  
  if (!status) {
    redirect("/api/auth/login");
  }

  if (status.isComplete) {
    redirect("/dashboard");
  }

  return status;
}
