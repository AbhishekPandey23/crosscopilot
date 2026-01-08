import { inngest } from '../client';
import prisma from '@/server/db/client';
import { GoogleDriveService } from '@/lib/integrations/google-drive';
import { NotionService } from '@/lib/integrations/notion';
import { EmbeddingService } from '@/server/services/embedding.service';
import { RFPParserService } from '@/server/services/rfp-parser.service';
import { SourceType } from '@prisma/client';
import crypto from 'crypto';

export const syncKnowledgeSource = inngest.createFunction(
  {
    id: 'knowledge-source-sync',
    name: 'Sync Knowledge Source',
    retries: 3,
  },
  { event: 'knowledge-source/sync' },
  async ({ event, step }) => {
    const { sourceId, organizationId, manual } = event.data;

    // Step 1: Get source details
    const source = await step.run('get-source', async () => {
      return await prisma.knowledgeSource.findUnique({
        where: { id: sourceId },
      });
    });

    if (!source) {
      throw new Error('Knowledge source not found');
    }

    // Step 2: Fetch documents based on source type
    const documents = await step.run('fetch-documents', async () => {
      switch (source.type) {
        case SourceType.GOOGLE_DRIVE:
          const driveService = new GoogleDriveService(
            source.credentials as any,
          );
          return await driveService.fetchDocuments();

        case SourceType.NOTION:
          const notionService = new NotionService(source.credentials as any);
          return await notionService.fetchPages();

        default:
          throw new Error(`Unsupported source type: ${source.type}`);
      }
    });

    // Step 3: Process each document
    let syncedCount = 0;
    let updatedCount = 0;

    for (const doc of documents) {
      const contentHash = crypto
        .createHash('md5')
        .update(doc.content)
        .digest('hex');

      // Check if document exists and needs update
      const existing = await prisma.document.findFirst({
        where: {
          sourceId,
          fileName: doc.fileName,
        },
      });

      if (existing && existing.contentHash === contentHash) {
        // Content hasn't changed, just update verification time
        await prisma.document.update({
          where: { id: existing.id },
          data: { lastVerifiedAt: new Date() },
        });
        continue;
      }

      // Create or update document
      const dbDoc = await step.run(
        `upsert-document-${doc.fileName}`,
        async () => {
          if (existing) {
            updatedCount++;
            // Delete old chunks
            await prisma.documentChunk.deleteMany({
              where: { documentId: existing.id },
            });

            return await prisma.document.update({
              where: { id: existing.id },
              data: {
                content: doc.content,
                contentHash,
                lastVerifiedAt: new Date(),
                freshnessStatus: 'FRESH',
              },
            });
          } else {
            syncedCount++;
            return await prisma.document.create({
              data: {
                sourceId,
                title: doc.title,
                content: doc.content,
                fileName: doc.fileName,
                fileType: doc.fileType,
                fileUrl: doc.url,
                contentHash,
                freshnessStatus: 'FRESH',
              },
            });
          }
        },
      );

      // Generate embeddings for new/updated document
      await step.run(`generate-embeddings-${dbDoc.id}`, async () => {
        const parser = new RFPParserService();
        const embeddingService = new EmbeddingService();

        const chunks = await parser.splitIntoChunks([
          {
            pageContent: doc.content,
            metadata: {},
          },
        ]);

        await embeddingService.storeDocumentChunks(dbDoc.id, chunks);
      });
    }

    // Step 4: Update source sync status
    await step.run('update-sync-status', async () => {
      await prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: {
          lastSyncedAt: new Date(),
          nextSyncAt: calculateNextSync(source.syncFrequency),
          syncErrors: undefined,
        },
      });
    });

    return {
      success: true,
      synced: syncedCount,
      updated: updatedCount,
      total: documents.length,
    };
  },
);

function calculateNextSync(frequency: string): Date {
  const now = new Date();
  switch (frequency) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    default:
      return now;
  }
}
