import { serve } from 'inngest/next';
import { inngest } from './client';
import { parseRFPDocument } from './functions/parse-rfp-document';
import { generateAnswer } from './functions/generate-answer';
import { generateBatchAnswers } from './functions/generate-batch-answers';
import { syncKnowledgeSource } from './functions/sync-knowledge-source';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    parseRFPDocument,
    generateAnswer,
    generateBatchAnswers,
    syncKnowledgeSource,
  ],
});
