import { redis } from "@/server/db/redis";
import { authed } from "@/server/api/middlewares/auth";
import { z } from "zod";

export const saveStep = authed
  .input(
    z.object({
      type: z.enum(["individual", "business"]),
      step: z.string(),              // e.g. "step1", "companyDetails"
      data: z.record(z.string(),z.any()),       // Whatever UI sends (auto-JSON saved)
    })
  )
  .output(
    z.object({
      saved: z.boolean(),
      progress: z.number(),
      completedSteps: z.number(),
      totalSteps: z.number(),
    })
  )
  .handler(async ({ input, context }) => {
    const totalSteps = 7;

    const redisKey = `onboarding:${context.user.id}:${input.type}`;

    // Store step data in redis — always JSON stringify
    await redis.hset(redisKey, {
      [input.step]: JSON.stringify(input.data),
    });

    // Recalculate progress
    const allSteps = (await redis.hgetall(redisKey)) ?? {};
    const completedSteps = Object.keys(allSteps).length;
    const progress = (completedSteps / totalSteps) * 100;

    return {
      saved: true,
      progress,
      completedSteps,
      totalSteps,
    };
  });
