import { inngest } from '../client';
import prisma from '@/server/db/client';
import { AnswerGeneratorService } from '@/server/services/answer-generator.service';
import { QuestionStatus } from '@prisma/client';

export const generateAnswer = inngest.createFunction(
  {
    id: 'question-generate-answer',
    name: 'Generate AI Answer for Question',
    retries: 2,
  },
  { event: 'question/generate-answer' },
  async ({ event, step }) => {
    const { questionId, rfpId, organizationId, regenerate } = event.data;

    // Step 1: Get question and RFP details
    const questionData = await step.run('get-question', async () => {
      const question = await prisma.rFPQuestion.findUnique({
        where: { id: questionId },
        include: {
          rfp: {
            select: {
              clientIndustry: true,
            },
          },
        },
      });

      if (!question) {
        throw new Error('Question not found');
      }

      return question;
    });

    // Step 2: Check if organization has knowledge sources
    const hasKnowledgeSources = await step.run(
      'check-knowledge-sources',
      async () => {
        const count = await prisma.knowledgeSource.count({
          where: {
            organizationId,
            isActive: true,
          },
        });
        return count > 0;
      },
    );

    if (!hasKnowledgeSources) {
      await step.run('update-no-sources', async () => {
        await prisma.rFPQuestion.update({
          where: { id: questionId },
          data: {
            aiAnswer:
              'No knowledge sources available. Please connect your knowledge sources to generate answers.',
            confidence: 0,
            status: QuestionStatus.PENDING,
          },
        });
      });
      return { success: false, reason: 'No knowledge sources' };
    }

    // Step 3: Generate answer using RAG
    const result = await step.run('generate-answer', async () => {
      const generator = new AnswerGeneratorService();

      return await generator.generateAnswer(
        questionData.questionText,
        organizationId,
        {
          toneStyle: questionData.toneStyle || 'professional',
          targetLength: questionData.targetLength || 'medium',
          clientIndustry: questionData.rfp.clientIndustry || undefined,
        },
      );
    });

    // Step 4: Save answer to database
    await step.run('save-answer', async () => {
      await prisma.rFPQuestion.update({
        where: { id: questionId },
        data: {
          aiAnswer: result.answer,
          answerSources: result.sources as any,
          confidence: result.confidence,
          status: QuestionStatus.AI_GENERATED,
        },
      });
    });

    // Step 5: Track usage
    await step.run('track-usage', async () => {
      await prisma.usageRecord.create({
        data: {
          organizationId,
          type: 'AI_ANSWER',
          quantity: 1,
          metadata: {
            rfpId,
            questionId,
            confidence: result.confidence,
          },
        },
      });

      // Update organization usage counter
      await prisma.organization.update({
        where: { id: organizationId },
        data: {
          usageAIAnswers: {
            increment: 1,
          },
        },
      });
    });

    return {
      success: true,
      confidence: result.confidence,
      sourcesUsed: result.sources.length,
    };
  },
);
