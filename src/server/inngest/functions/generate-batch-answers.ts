import { inngest } from '../client';

export const generateBatchAnswers = inngest.createFunction(
  {
    id: 'question-generate-batch-answers',
    name: 'Generate Batch AI Answers',
    concurrency: {
      limit: 5, // Process 5 at a time
    },
  },
  { event: 'question/generate-batch-answers' },
  async ({ event, step }) => {
    const { rfpId, questionIds, organizationId } = event.data;

    // Fan-out: Send individual generate events for each question
    await step.run('fan-out-generate-jobs', async () => {
      const events = questionIds.map((questionId: string) => ({
        name: 'question/generate-answer',
        data: {
          questionId,
          rfpId,
          organizationId,
        },
      }));

      await inngest.send(events);
    });

    return {
      success: true,
      totalQuestions: questionIds.length,
    };
  },
);
