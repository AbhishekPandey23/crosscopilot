import { redis } from "@/server/db/redis"; // upstash
import prisma from "@/server/db/client";
import { authed } from "@/server/api/middlewares/auth";
import { z } from "zod";

export const getProgress = authed
  .input(
    z.object({
      type: z.enum(["individual", "business"]),
    })
  )
  .output(
    z.object({
      progress: z.number(),
      completedSteps: z.number(),
      totalSteps: z.number(),
      data: z.record(z.string(),z.any()).optional(), // <-- return partial data
    })
  )
  .handler(async ({ input, context }) => {
    const totalSteps = 7;

    const redisKey = `onboarding:${context.user.id}:${input.type}`;
    const stepData = await redis.hgetall(redisKey) ?? {};
    const completedSteps = Object.keys(stepData).length;

    const progress = (completedSteps / totalSteps) * 100;

    // Parse stringified JSON
    const parsed = Object.fromEntries(
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

    return {
      progress,
      completedSteps,
      totalSteps,
      data: parsed,
    };
  });
