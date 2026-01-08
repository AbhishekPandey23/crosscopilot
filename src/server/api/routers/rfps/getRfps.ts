import { z } from "zod";
import { authed } from "../../middlewares/auth";


import prisma from "@/src/server/db/client";

/**
 * Fetches a single RFP by ID with all related data
 */
export const getRFP = authed
  .input(z.object({ id: z.string().cuid(),includeQuestions: z.boolean().default(true), }))
  .handler(async ({ input, context }) => {
    const organizationId = context.auth.organizationCode;
    
    const rfp = await prisma.rFP.findFirst({
      where: { id: input.id, organizationId },
      include: {
        organization: true,
        createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        questions: input.includeQuestions ? {
            orderBy: [
              { sectionName: 'asc' },
              { questionNumber: 'asc' },
              { createdAt: 'asc' },
            ],
          } : false,
        complianceChecks: {
          orderBy: { checkedAt: "desc" },
          take: 1,
          include: {
            issues: true,
          },
        },
        bidAnalysis: true,
        _count: {
            select: {
              questions: true,
            },
          },
        redTeamReviews: {
          orderBy: { reviewedAt: "desc" },
          take: 1,
          include: {
            findings: true,
          },
        },
      },
    });

    if (!rfp) {
      throw new Error("RFP not found");
    }

    // Calculate completion statistics
    const totalQuestions = rfp._count.questions;
    const answeredQuestions = rfp.questions.filter(
      (q) => q.status !== "PENDING"
    ).length;
    const approvedQuestions = rfp.questions.filter(
      (q) => q.status === "APPROVED"
    ).length;

    return {
      ...rfp,
      stats: {
        totalQuestions,
        answeredQuestions,
        approvedQuestions,
        completionPercentage:
          totalQuestions > 0
            ? Math.round((answeredQuestions / totalQuestions) * 100)
            : 0,
      },
    };
  });

/**
 * Lists all RFPs for an organization with optional filtering
 */
export const listRFPs = authed
  .input(
    z.object({
      organizationId: z.string(),
      status: z.string().optional(),
      priority: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    })
  )
  .handler(async ({ input, context }) => {
    const organizationId = context.auth.organizationCode;
    const where: Record<string, unknown> = {
      organizationId,
    };

    if (input.status) {
      where.status = input.status;
    }

    if (input.priority) {
      where.priority = input.priority;
    }

    if (input.search) {
      where.OR = [
        { title: { contains: input.search, mode: "insensitive" } },
        { clientName: { contains: input.search, mode: "insensitive" } },
        { description: { contains: input.search, mode: 'insensitive' } },
      ];
    }

    const [rfps, total] = await Promise.all([
      prisma.rFP.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' },
        ],
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          _count: {
            select: { 
              questions: true,
            },
          },
          questions: {
            where: {
              status: { not: 'PENDING' }
            },
            select: {
              id: true
            }
          }
        },
        take: input.limit,
        skip: input.offset,
      }),
      prisma.rFP.count({ where }), // Count total RFPs for pagination
    ]);

    return {
      rfps,
      total,
      hasMore: input.offset + rfps.length < total, // Check if there are more RFPs to load
    };
  });

/**
 * Updates an RFP's basic information
 */
export const updateRFP = authed
  .input(
    z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      clientName: z.string().optional(),
      clientIndustry: z.string().optional(),
      contactEmail: z.string().email().optional(),
      priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
      status: z.enum(["DRAFT", "IN_PROGRESS", "REVIEW", "SUBMITTED", "WON", "LOST", "NO_BID"]).optional(),
      dueDate: z.string().optional(),
      estimatedValue: z.number().optional(),
      tags: z.array(z.string()).optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const userId = context.auth.kindeUserId;
    const organizationId = context.auth.organizationCode;

    const { id, dueDate, ...rest } = input;
    // Check if RFP exists and user has access
    const existing = await prisma.rFP.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new Error("RFP not found");
    }

    // Build update data explicitly to avoid type issues
    const updateData: Record<string, unknown> = { ...rest };
    if (dueDate) {
      updateData.dueDate = new Date(dueDate);
    }

    const rfp = await prisma.rFP.update({
      where: { id },
      data: updateData,
      include: {
          questions: true,
        },
    });

    // Log the update
    await prisma.activityLog.create({
      data: {
        type: "RFP_UPDATED",
        description: `RFP "${rfp.title}" was updated`,
        userId,
        rfpId: rfp.id,
        metadata: { updatedFields: Object.keys(updateData), questions: rfp.questions },
      },
    });

    return rfp;
  });

/**
 * Deletes an RFP
 */
export const deleteRFP = authed
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const userId = context.auth.kindeUserId;
    const organizationId = context.auth.organizationCode;

    const existing = await prisma.rFP.findFirst({
      where: { id: input.id, organizationId },
    });

    if (!existing) {
      throw new Error("RFP not found");
    }

    await prisma.rFP.delete({
      where: { id: input.id },
    });

    // Log the deletion
    await prisma.activityLog.create({
      data: {
        type: 'RFP_DELETED',
        description: `RFP "${existing.title}" was deleted`,
        userId,
        rfpId: existing.id,
        metadata: { deletedFields: Object.keys(existing), title: existing.title },
      },
    });

    return { success: true };
  });
