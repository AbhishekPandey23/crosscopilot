import { redis } from "@/server/db/redis";
import prisma from "@/server/db/client";
import { authed } from "@/server/api/middlewares/auth";
import { z } from "zod";

export const completeOnboarding = authed
  .input(
    z.object({
      type: z.enum(["individual", "business"]),
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      profileId: z.string(),
    })
  )
  .handler(async ({ input, context }) => {
    const redisKey = `onboarding:${context.user.id}:${input.type}`;
    
    // Get all step data from Redis
    const stepData = await redis.hgetall(redisKey);
    
    if (!stepData || Object.keys(stepData).length === 0) {
      throw new Error("No onboarding data found");
    }

    // Parse all step data
    const parsedData = Object.fromEntries(
      Object.entries(stepData).map(([k, v]) => {
        if (typeof v === 'string') {
          try {
            return [k, JSON.parse(v)];
          } catch (e) {
            console.error(`Failed to parse Redis data for key ${k}:`, v);
            return [k, v];
          }
        }
        return [k, v];
      })
    );

    // Combine all step data into one object
    const combinedData = Object.values(parsedData).reduce(
      (acc, curr) => ({ ...acc, ...curr }),
      {}
    );

    let profileId: string;

    // Save to database based on type
    if (input.type === "individual") {
      const profile = await (prisma as any).freelancerProfile.upsert({
        where: { userId: context.user.id },
        create: {
          userId: context.user.id,
          title: (combinedData as any).occupation || "Individual",
          bio: (combinedData as any).bio || null,
          experience: 0,
          onboardingStep: 7,
          onboardingData: combinedData,
          onboardingStatus: "COMPLETED",
          skills: [],
          websiteUrl: (combinedData as any).website || null,
        },
        update: {
          onboardingStep: 7,
          onboardingData: combinedData,
          onboardingStatus: "COMPLETED",
        },
      });
      profileId = profile.id;
    } else {
      const profile = await (prisma as any).companyProfile.upsert({
        where: { userId: context.user.id },
        create: {
          userId: context.user.id,
          name: (combinedData as any).companyName || "Business",
          description: (combinedData as any).description || null,
          industry: [],
          skills: [],
          onboardingStep: 7,
          onboardingData: combinedData,
          onboardingStatus: "COMPLETED",
          websiteUrl: (combinedData as any).website || null,
        },
        update: {
          onboardingStep: 7,
          onboardingData: combinedData,
          onboardingStatus: "COMPLETED",
        },
      });
      profileId = profile.id;
    }

    // Update or create user with vendorType
    await (prisma as any).user.upsert({
      where: { id: context.user.id },
      create: {
        id: context.user.id,
        email: context.user.email,
        name: context.user.fullName || context.user.email,
        vendorType: input.type === "individual" ? "INDIVIDUAL" : "BUSINESS",
      },
      update: {
        vendorType: input.type === "individual" ? "INDIVIDUAL" : "BUSINESS",
      },
    });

    // Delete Redis data after successful save
    await redis.del(redisKey);

    return {
      success: true,
      profileId,
    };
  });
