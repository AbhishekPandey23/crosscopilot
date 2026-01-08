import { inngest } from '../client';
import prisma from '@/server/db/client';
import { RFPParserService } from '@/server/services/rfp-parser.service';
import { EmbeddingService } from '@/server/services/embedding.service';
import { RFPStatus } from '@prisma/client';
import crypto from 'crypto';

export const parseRFPDocument = inngest.createFunction(
  {
    id: 'rfp-parse-document',
    name: 'Parse RFP Document',
    retries: 3,
  },
  { event: 'rfp/parse-document' },
  async ({ event, step }) => {
    const { rfpId, fileUrl, fileName, fileType } = event.data;

    // Step 1: Update RFP status to processing
    await step.run('update-rfp-status-processing', async () => {
      await prisma.rFP.update({
        where: { id: rfpId },
        data: { status: RFPStatus.DRAFT },
      });
    });

    // Step 2: Parse the document
    const documents = await step.run('parse-document', async () => {
      const parser = new RFPParserService();
      return await parser.parseDocument(fileUrl, fileType);
    });

    // Step 3: Extract questions from document
    const questions = await step.run('extract-questions', async () => {
      const parser = new RFPParserService();
      return await parser.extractQuestions(documents);
    });

    // Step 4: Save questions to database
    await step.run('save-questions', async () => {
      await prisma.rFPQuestion.createMany({
        data: questions.map((q, index) => ({
          rfpId,
          questionText: q.questionText,
          sectionName: q.sectionName,
          questionNumber: q.questionNumber || `Q${index + 1}`,
          status: 'PENDING',
        })),
      });
    });

    // Step 5: Create a document entry for the RFP itself
    const documentId = await step.run('create-document-entry', async () => {
      const contentHash = crypto
        .createHash('md5')
        .update(documents.map((d) => d.pageContent).join(''))
        .digest('hex');

      // Get or create a default knowledge source for RFP documents
      const rfp = await prisma.rFP.findUnique({
        where: { id: rfpId },
        select: { organizationId: true },
      });

      if (!rfp) throw new Error('RFP not found');

      let rfpSource = await prisma.knowledgeSource.findFirst({
        where: {
          organizationId: rfp.organizationId,
          type: 'MANUAL_UPLOAD',
          name: 'RFP Documents',
        },
      });

      if (!rfpSource) {
        rfpSource = await prisma.knowledgeSource.create({
          data: {
            organizationId: rfp.organizationId,
            type: 'MANUAL_UPLOAD',
            name: 'RFP Documents',
            autoSync: false,
          },
        });
      }

      const doc = await prisma.document.create({
        data: {
          sourceId: rfpSource.id,
          title: fileName,
          content: documents.map((d) => d.pageContent).join('\n\n'),
          fileUrl,
          fileName,
          fileType,
          contentHash,
          freshnessStatus: 'FRESH',
        },
      });

      return doc.id;
    });

    // Step 6: Split into chunks and generate embeddings
    await step.run('generate-embeddings', async () => {
      const parser = new RFPParserService();
      const embeddingService = new EmbeddingService();

      const chunks = await parser.splitIntoChunks(documents);
      await embeddingService.storeDocumentChunks(documentId, chunks);
    });

    // Step 7: Update RFP status to ready
    await step.run('update-rfp-status-ready', async () => {
      await prisma.rFP.update({
        where: { id: rfpId },
        data: { status: RFPStatus.IN_PROGRESS },
      });
    });

    return {
      success: true,
      questionsExtracted: questions.length,
      documentId,
    };
  },
);
