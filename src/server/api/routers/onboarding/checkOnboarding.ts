import { redis } from "@/server/db/redis";
import prisma from "@/server/db/client";
import { authed } from "@/server/api/middlewares/auth";
import { z } from "zod";

export const checkOnboarding = authed
  .input(z.void())
  .output(
    z.object({
      isComplete: z.boolean(),
      userType: z.enum(["individual", "business"]).nullable(),
      currentStep: z.number(),
      hasRedisData: z.boolean(),
      redisType: z.enum(["individual", "business"]).nullable(),
    })
  )
  .handler(async ({ context }) => {
    // Check database first
    const user = await (prisma as any).user.findUnique({
      where: { id: context.user.id },
      include: {
        freelancerProfile: true,
        companyProfile: true,
      },
    });

    // If user exists in DB and onboarding is done
    if (user?.freelancerProfile?.onboardingStatus === "COMPLETED") {
      return {
        isComplete: true,
        userType: "individual" as const,
        currentStep: 7,
        hasRedisData: false,
        redisType: null,
      };
    }

    if (user?.companyProfile?.onboardingStatus === "COMPLETED") {
      return {
        isComplete: true,
        userType: "business" as const,
        currentStep: 7,
        hasRedisData: false,
        redisType: null,
      };
    }

    // Check Redis for in-progress onboarding
    const individualKey = `onboarding:${context.user.id}:individual`;
    const businessKey = `onboarding:${context.user.id}:business`;

    const individualData = await redis.hgetall(individualKey);
    const businessData = await redis.hgetall(businessKey);

    const individualSteps = individualData ? Object.keys(individualData).length : 0;
    const businessSteps = businessData ? Object.keys(businessData).length : 0;

    // Determine which type has more progress
    if (individualSteps > 0 || businessSteps > 0) {
      const type = individualSteps >= businessSteps ? "individual" : "business";
      const currentStep = Math.max(individualSteps, businessSteps) + 1; // Next step to complete

      return {
        isComplete: false,
        userType: type,
        currentStep: Math.min(currentStep, 7),
        hasRedisData: true,
        redisType: type,
      };
    }

    // No onboarding data found - new user
    return {
      isComplete: false,
      userType: null,
      currentStep: 1,
      hasRedisData: false,
      redisType: null,
    };
  });
