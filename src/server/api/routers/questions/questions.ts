import { z } from "zod";
import { authed } from "../../middlewares/auth";


import prisma from "@/src/server/db/client";
import { inngest } from "@/src/server/inngest/client";
import { generateAnswer, regenerateAnswer } from "@/src/server/services/rag-service";
import { QuestionStatus } from "@prisma/client";

/**
 * Lists all questions for an RFP
 */
export const listQuestions = authed
  .input(
    z.object({
      rfpId: z.string().cuid(),
      status: z.nativeEnum(QuestionStatus).optional(),
      sectionName: z.string().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const userId = context.auth.kindeUserId;
    const organizationId = context.auth.organizationCode;

    // Verify RFP belongs to organization
    const rfp = await prisma.rFP.findFirst({
      where: { id: input.rfpId, organizationId },
    });
    if (!rfp) throw new Error("RFP not found");

    const where: Record<string, unknown> = {
      rfpId: input.rfpId,
    };

    if (input.status) {
      where.status = input.status;
    }

    if (input.sectionName) {
      where.sectionName = input.sectionName;
    }

    const questions = await prisma.rFPQuestion.findMany({
      where,
      orderBy: [
        { sectionName: "asc" },
        { questionNumber: "asc" },
        { createdAt: "asc" },
      ],
      include: {
        rfp: {
          select: {
            id: true,
            title: true,
            organizationId: true,
          },
        },
      },
    });

    return questions;
  });

/**
 * Get a single question with full details
 */
export const getQuestion = authed
  .input(z.object({ id: z.string().cuid() }))
  .handler(async ({ input, context }) => {
    const organizationId = context.auth.organizationCode;

    const question = await prisma.rFPQuestion.findFirst({
      where: { id: input.id, rfp:{organizationId} },
      include: {
        rfp: {
          select: {
            id: true,
            title: true,
            organizationId: true,
            clientName: true,
            clientIndustry: true,
          },
        },
      },
    });

    if (!question) {
      throw new Error("Question not found");
    }

    return question;
  });

/**
 * Generates an AI answer for a question synchronously
 */
export const generateQuestionAnswer = authed
  .input(
    z.object({
      questionId: z.string().cuid(),
      toneStyle: z.string().optional(),
      maxLength: z.enum(["short", "medium", "long"]).optional(),
      rfpId: z.string().cuid(),
      regenerate: z.boolean().default(false),
    })
  )
  .handler(async ({ input, context }) => {
    const userId = context.auth.kindeUserId;
    const organizationId = context.auth.organizationCode;



    // Get the question and its RFP
    const question = await prisma.rFPQuestion.findFirst({
      where: { id: input.questionId, rfpId: input.rfpId,
          rfp: {
            organizationId,
        },
      },
      include: {
        rfp: true,
      },
    });

    if (!question) {
      throw new Error("Question not found");
    }

    // Check if already has answer and not regenerating
      if (!input.regenerate && question.aiAnswer) {
        throw new Error("Question already has an answer");
      }

    // Generate answer using RAG
    {/* const result = await generateAnswer(
      question.questionText,
      question.rfp.organizationId,
      {
        toneStyle: input.toneStyle || question.toneStyle || "professional",
        maxLength: input.maxLength || (question.targetLength as "short" | "medium" | "long") || "medium",
      }
    ); */}

    // Trigger Inngest job to generate answer
      await inngest.send({
        name: 'question/generate-answer',
        data: {
          questionId: input.questionId,
          rfpId: input.rfpId,
          organizationId,
        },
      });
    
    // Log activity
      await prisma.activityLog.create({
        data: {
          type: 'AI_ANSWER_GENERATED',
          description: `Generating AI answer for question`,
          userId: userId!,
          rfpId: input.rfpId,
          metadata: {
            questionId: input.questionId,
            questionText: question.questionText.substring(0, 200),
          },
        },
      });

    /*// Update the question with the generated answer
    const updatedQuestion = await prisma.rFPQuestion.update({
      where: { id: input.questionId,
      },
      data: {
        aiAnswer: result.answer,
        answerSources: JSON.parse(JSON.stringify(result.sources)),
        confidence: result.confidence,
        status: QuestionStatus.AI_GENERATED,
        toneStyle: input.toneStyle || question.toneStyle,
        targetLength: input.maxLength || question.targetLength,
      },
    });

    return {
      question: updatedQuestion,
      sources: result.sources,
      confidence: result.confidence,
    };*/
    return {
      success: true,
      message: "Question answer generation triggered successfully",
    };
  });

/**
 * Triggers async answer generation for all pending questions
 */
export const generateAllAnswers = authed
  .input(
    z.object({
      rfpId: z.string().cuid(),
      overwriteExisting: z.boolean().default(false),
    })
  )
  .handler(async ({ input, context }) => {
    const userId = context.auth.kindeUserId;
    const organizationId = context.auth.organizationCode;

    // Verify RFP exists and belongs to organization
    const rfp = await prisma.rFP.findFirst({
      where: { id: input.rfpId, organizationId },
    });
    if (!rfp) throw new Error("RFP not found");

    // Get all questions that need answers
      const where: any = { rfpId: input.rfpId };
      
      if (!input.overwriteExisting) {
        where.status = QuestionStatus.PENDING;
    }

    const questions = await prisma.rFPQuestion.findMany({
        where,
        select: { id: true },
    });
    
    if (questions.length === 0) {
        throw new Error("No questions found");
    }

    // Trigger Inngest job to generate all answers in batch
      await inngest.send({
        name: 'question/generate-batch-answers',
        data: {
          rfpId: input.rfpId,
          questionIds: questions.map(q => q.id),
          organizationId,
        },
      });
    
    // Log activity
      await prisma.activityLog.create({
        data: {
          type: 'AI_ANSWER_GENERATED',
          description: `Generating AI answers for ${questions.length} questions`,
          userId: userId!,
          rfpId: input.rfpId,
          metadata: {
            questionCount: questions.length,
          },
        },
      });

    /* // Get count of pending questions
    const pendingCount = await prisma.rFPQuestion.count({
      where: {
        rfpId: input.rfpId,
        status: QuestionStatus.PENDING,
      },
    });

    return {
      success: true,
      message: `Started generating answers for ${pendingCount} questions`,
      pendingCount,
    }; */
    return {
      success: true,
      message: `Generating answers for ${questions.length} questions`,
      count: questions.length,
    };
  });

/**
 * Regenerates an answer with feedback
 */
export const regenerateQuestionAnswer = authed
  .input(
    z.object({
      questionId: z.string(),
      feedback: z.string(),
    })
  )
  .handler(async ({ input }) => {
    const question = await prisma.rFPQuestion.findUnique({
      where: { id: input.questionId },
      include: {
        rfp: {
          select: { organizationId: true },
        },
      },
    });

    if (!question) {
      throw new Error("Question not found");
    }

    if (!question.aiAnswer) {
      throw new Error("No previous answer to regenerate from");
    }

    const result = await regenerateAnswer(
      question.questionText,
      question.rfp.organizationId,
      input.feedback,
      question.aiAnswer
    );

    const updatedQuestion = await prisma.rFPQuestion.update({
      where: { id: input.questionId },
      data: {
        aiAnswer: result.answer,
        answerSources: JSON.parse(JSON.stringify(result.sources)),
        confidence: result.confidence,
        status: QuestionStatus.AI_GENERATED,
      },
    });

    return {
      question: updatedQuestion,
      sources: result.sources,
      confidence: result.confidence,
    };
  });

/**
 * Updates a question's answer (manual edit)
 */
export const updateQuestionAnswer = authed
  .input(
    z.object({
      questionId: z.string(),
      finalAnswer: z.string().min(1, "Answer cannot be empty"),
      status: z.nativeEnum(QuestionStatus).optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const userId = context.auth.kindeUserId;
    const organizationId = context.auth.organizationCode;

    // Verify question exists and belongs to organization
      const existing = await prisma.rFPQuestion.findFirst({
        where: {
          id: input.questionId,
          rfp: {
            organizationId,
          },
        },
      });
      if (!existing) throw new Error("Question not found");

    const question = await prisma.rFPQuestion.update({
      where: { id: input.questionId },
      data: {
        finalAnswer: input.finalAnswer,
        status: input.status || QuestionStatus.REVIEWED,
        editedBy: userId,
        editedAt: new Date(),
      },
    });

    return question;
  });

/**
 * Approves a question's answer
 */
export const approveAnswer = authed
  .input(z.object({ questionId: z.string() }))
  .handler(async ({ input, context }) => {
    const userId = context.auth.kindeUserId;


    const question = await prisma.rFPQuestion.update({
      where: { id: input.questionId },
      data: {
        status: QuestionStatus.APPROVED,
        editedBy: userId,
        editedAt: new Date(),
      },
    });

    return question;
  });

export const updateQuestionStatus = authed.
  input(z.object({ questionId: z.string(), status: z.nativeEnum(QuestionStatus) }))
  .handler(async ({ input, context }) => {
    const userId = context.auth.kindeUserId;
    const organizationId = context.auth.organizationCode;

    // Verify question exists and belongs to organization
      const existing = await prisma.rFPQuestion.findFirst({
        where: {
          id: input.questionId,
          rfp: {
            organizationId,
          },
        },
      });
      if (!existing) throw new Error("Question not found");

    const question = await prisma.rFPQuestion.update({
      where: { id: input.questionId },
      data: {
        status: input.status,
        editedBy: userId,
        editedAt: new Date(),
      },
    });

    return question;
  });

export const updateToneSettings = authed
  .input(
    z.object({
    questionId: z.string().cuid(),
    toneStyle: z.string().optional(),
    targetLength: z.string().optional(),
    })
)
.handler(async ({ input, context }) => {
  const organizationId = context.auth.organizationCode;

  // Verify question exists and belongs to organization
      const existing = await prisma.rFPQuestion.findFirst({
        where: {
          id: input.questionId,
          rfp: {
            organizationId,
          },
        },
      });
    if (!existing) throw new Error("Question not found");

  const question = await prisma.rFPQuestion.update({
        where: { id: input.questionId },
        data: {
          toneStyle: input.toneStyle,
          targetLength: input.targetLength,
        },
      });

      // If answer already exists, regenerate with new settings
      if (question.aiAnswer) {
        await inngest.send({
          name: 'question/generate-answer',
          data: {
            questionId: input.questionId,
            rfpId: existing.rfpId,
            organizationId,
            regenerate: true,
          },
        });
      }

      return question;
});

export const bulkUpdateStatus = authed
  .input(
    z.object({
     questionIds: z.array(z.string().cuid()),
      status: z.nativeEnum(QuestionStatus),
    })
)
.handler(async ({ input, context }) => {
  const organizationId = context.auth.organizationCode;

  // Verify all questions belong to organization
      const count = await prisma.rFPQuestion.count({
        where: {
          id: { in: input.questionIds },
          rfp: {
            organizationId,
          },
        },
      });

  if (count !== input.questionIds.length) {
    throw new Error("Not all questions belong to organization");
  }

    await prisma.rFPQuestion.updateMany({
        where: {
          id: { in: input.questionIds },
        },
        data: {
          status: input.status,
        },
      });

    return { success: true, updatedCount: input.questionIds.length };
});

export const getStats = authed
.input(z.object({
      rfpId: z.string().cuid(),
}))
.handler(async ({ input, context }) => {
  const organizationId = context.auth.organizationCode;

  // Verify RFP belongs to organization
      const rfp = await prisma.rFP.findFirst({
        where: { id: input.rfpId, organizationId },
      });
  if (!rfp) throw new Error("RFP not found");
  
  const [
        total,
        pending,
        aiGenerated,
        reviewed,
        approved,
        avgConfidence,
      ] = await Promise.all([
        prisma.rFPQuestion.count({ where: { rfpId: input.rfpId } }),
        prisma.rFPQuestion.count({ 
          where: { rfpId: input.rfpId, status: QuestionStatus.PENDING } 
        }),
        prisma.rFPQuestion.count({ 
          where: { rfpId: input.rfpId, status: QuestionStatus.AI_GENERATED } 
        }),
        prisma.rFPQuestion.count({ 
          where: { rfpId: input.rfpId, status: QuestionStatus.REVIEWED } 
        }),
        prisma.rFPQuestion.count({ 
          where: { rfpId: input.rfpId, status: QuestionStatus.APPROVED } 
        }),
        prisma.rFPQuestion.aggregate({
          where: { 
            rfpId: input.rfpId,
            confidence: { not: null },
          },
          _avg: { confidence: true },
        }),
      ]);

      return {
        total,
        byStatus: {
          pending,
          aiGenerated,
          reviewed,
          approved,
        },
        progress: total > 0 ? Math.round((approved / total) * 100) : 0,
        avgConfidence: avgConfidence._avg.confidence || 0,
      };
});