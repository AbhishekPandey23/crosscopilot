// server/orpc/routers/knowledge-source.router.ts
import { z } from 'zod';
import prisma from '@/src/server/db/client';
import { inngest } from '@/server/inngest/client';
import { SourceType, ContentStatus } from '@prisma/client';
import { encryptCredentials, decryptCredentials } from '@/lib/encryption';
import { authed } from '../../middlewares/auth';



  // List all knowledge sources for organization
  export const list= authed
    .input(z.object({
      type: z.nativeEnum(SourceType).optional(),
      isActive: z.boolean().optional(),
    }).optional())
    .handler(async ({ input, context }) => {
        const organizationId = context.auth.organizationCode;

      const where: any = { organizationId };

      if (input?.type) {
        where.type = input.type;
      }

      if (input?.isActive !== undefined) {
        where.isActive = input.isActive;
      }

      const sources = await prisma.knowledgeSource.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              documents: true,
            },
          },
        },
      });

      // Don't return credentials in list view
      return sources.map(source => ({
        ...source,
        credentials: undefined,
      }));
    });

  // Get single knowledge source
  export const getById = authed
    .input(z.object({ 
      id: z.string().cuid(),
    }))
    .handler(async ({ input, context }) => {
      const organizationId = context.auth.organizationCode;

      const source = await prisma.knowledgeSource.findFirst({
        where: {
          id: input.id,
          organizationId,
        },
        include: {
          documents: {
            orderBy: { lastVerifiedAt: 'desc' },
            take: 10,
          },
          _count: {
            select: {
              documents: true,
            },
          },
        },
      });

      if (!source) {
        throw new Error('Knowledge source not found');
      }

      // Don't return raw credentials
      return {
        ...source,
        credentials: undefined,
        hasCredentials: !!source.credentials,
      };
    });

  // Create new knowledge source
  export const create = authed
    .input(z.object({
      name: z.string().min(1, "Name is required"),
      type: z.nativeEnum(SourceType),
      url: z.string().url().optional(),
      credentials: z.record(z.string(), z.any()).optional(),
      autoSync: z.boolean().default(true),
      syncFrequency: z.enum(['daily', 'weekly', 'manual']).default('daily'),
    }))
    .handler(async ({ input, context }) => {
      const organizationId = context.auth.organizationCode;

      // Encrypt credentials if provided
      const encryptedCredentials = input.credentials 
        ? await encryptCredentials(input.credentials)
        : null;

      // Calculate next sync time
      const nextSyncAt = input.autoSync 
        ? calculateNextSync(input.syncFrequency)
        : null;

      const source = await prisma.knowledgeSource.create({
        data: {
          name: input.name,
          type: input.type,
          url: input.url,
          credentials: encryptedCredentials,
          autoSync: input.autoSync,
          syncFrequency: input.syncFrequency,
          nextSyncAt,
          organizationId,
        },
      });

      // Trigger initial sync if auto-sync is enabled
      if (input.autoSync) {
        await inngest.send({
          name: 'knowledge-source/sync',
          data: {
            sourceId: source.id,
            organizationId,
          },
        });
      }

      return {
        ...source,
        credentials: undefined,
      };
    });

  // Update knowledge source
  export const update = authed
    .input(z.object({
      id: z.string().cuid(),
      name: z.string().min(1).optional(),
      url: z.string().url().optional(),
      credentials: z.record(z.string(), z.any()).optional(),
      autoSync: z.boolean().optional(),
      syncFrequency: z.enum(['daily', 'weekly', 'manual']).optional(),
      isActive: z.boolean().optional(),
    }))
    .handler(async ({ input, context }) => {
      const organizationId = context.auth.organizationCode;

      const { id, credentials, ...updateData } = input;

      // Verify source exists and belongs to organization
      const existing = await prisma.knowledgeSource.findFirst({
        where: { id, organizationId },
      });

      if (!existing) {
        throw new Error('Knowledge source not found');
      }

      // Encrypt new credentials if provided
      const encryptedCredentials = credentials 
        ? await encryptCredentials(credentials)
        : undefined;

      // Recalculate next sync if frequency changed
      const nextSyncAt = updateData.syncFrequency
        ? calculateNextSync(updateData.syncFrequency)
        : undefined;

      const source = await prisma.knowledgeSource.update({
        where: { id },
        data: {
          ...updateData,
          ...(encryptedCredentials && { credentials: encryptedCredentials }),
          ...(nextSyncAt && { nextSyncAt }),
        },
      });

      return {
        ...source,
        credentials: undefined,
      };
    });

  // Delete knowledge source
  export const deleteSource = authed
    .input(z.object({ id: z.string().cuid() }))
    .handler(async ({ input, context }) => {
      const organizationId = context.auth.organizationCode;

      // Verify source exists and belongs to organization
      const source = await prisma.knowledgeSource.findFirst({
        where: { id: input.id, organizationId },
      });

      if (!source) {
        throw new Error('Knowledge source not found');
      }

      // Delete source (cascade will handle documents and chunks)
      await prisma.knowledgeSource.delete({
        where: { id: input.id },
      });

      return { success: true };
    });

  // Trigger manual sync
  export const syncNow = authed
    .input(z.object({ id: z.string().cuid() }))
    .handler(async ({ input, context }) => {
      const organizationId = context.auth.organizationCode;

      // Verify source exists and belongs to organization
      const source = await prisma.knowledgeSource.findFirst({
        where: { id: input.id, organizationId },
      });

      if (!source) {
        throw new Error('Knowledge source not found');
      }

      if (!source.isActive) {
        throw new Error('Cannot sync inactive source');
      }

      // Trigger sync job
      await inngest.send({
        name: 'knowledge-source/sync',
        data: {
          sourceId: source.id,
          organizationId,
          manual: true,
        },
      });

      return { success: true, message: 'Sync started' };
    });

  // Get sync status
  export const getSyncStatus = authed
    .input(z.object({ id: z.string().cuid() }))
    .handler(async ({ input, context }) => {
      const organizationId = context.auth.organizationCode;

      const source = await prisma.knowledgeSource.findFirst({
        where: { id: input.id, organizationId },
        select: {
          id: true,
          name: true,
          lastSyncedAt: true,
          nextSyncAt: true,
          syncErrors: true,
          isActive: true,
          _count: {
            select: {
              documents: true,
            },
          },
        },
      });

      if (!source) {
        throw new Error('Knowledge source not found');
      }

      return source;
    });

  // List documents from a source
  export const listDocuments = authed
    .input(z.object({
      sourceId: z.string().cuid(),
      status: z.nativeEnum(ContentStatus).optional(),
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().optional(),
    }))
    .handler(async ({ input, context }) => {
      const organizationId = context.auth.organizationCode;

      // Verify source belongs to organization
      const source = await prisma.knowledgeSource.findFirst({
        where: { id: input.sourceId, organizationId },
      });

      if (!source) {
        throw new Error('Knowledge source not found');
      }

      const where: any = { sourceId: input.sourceId };

      if (input.status) {
        where.freshnessStatus = input.status;
      }

      const documents = await prisma.document.findMany({
        where,
        take: input.limit,
        skip: input.cursor ? 1 : 0,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { lastVerifiedAt: 'desc' },
        include: {
          _count: {
            select: {
              chunks: true,
            },
          },
        },
      });

      return {
        documents,
        nextCursor: documents.length === input.limit 
          ? documents[documents.length - 1].id 
          : undefined,
      };
    });

  // Get knowledge source statistics
  export const getStats = authed
    .handler(async ({ context }) => {
      const organizationId = context.auth.organizationCode;

      const [
        totalSources,
        activeSources,
        totalDocuments,
        freshDocuments,
        outdatedDocuments,
      ] = await Promise.all([
        prisma.knowledgeSource.count({ where: { organizationId } }),
        prisma.knowledgeSource.count({ 
          where: { organizationId, isActive: true } 
        }),
        prisma.document.count({
          where: {
            source: { organizationId },
          },
        }),
        prisma.document.count({
          where: {
            source: { organizationId },
            freshnessStatus: ContentStatus.FRESH,
          },
        }),
        prisma.document.count({
          where: {
            source: { organizationId },
            freshnessStatus: ContentStatus.OUTDATED,
          },
        }),
      ]);

      return {
        totalSources,
        activeSources,
        totalDocuments,
        byStatus: {
          fresh: freshDocuments,
          outdated: outdatedDocuments,
          needsReview: totalDocuments - freshDocuments - outdatedDocuments,
        },
      };
    });

// Helper function to calculate next sync time
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