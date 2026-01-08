// server/orpc/routers/rfp.router.ts
import { z } from 'zod';
import prisma from '@/src/server/db/client';
import { inngest } from '@/server/inngest/client';
import { RFPStatus, RFPPriority } from '@prisma/client';
import { authed } from '../../middlewares/auth';



export const createRFP = authed
  // Create new RFP after file upload
  .input(z.object({
    title: z.string().min(1, "Title is required"),
    clientName: z.string().min(1, "Client name is required"),
    description: z.string().optional(),
    dueDate: z.date().optional(),
    clientIndustry: z.string().optional(),
    contactEmail: z.string().email().optional(),
    priority: z.nativeEnum(RFPPriority).default(RFPPriority.MEDIUM),
    estimatedValue: z.number().optional(),
    currency: z.string().default("USD"),
    tags: z.array(z.string()).default([]),
    fileUrl: z.string().optional(),
    fileName: z.string().optional(),
    fileSize: z.number().optional(),
  }))
  .handler(async ({ input, context }) => {
    const userId = context.auth.kindeUserId;
    const organizationId = context.auth.organizationCode;


    // Create RFP
    const rfp = await prisma.rFP.create({
      data: {
        title: input.title,
        clientName: input.clientName,
        description: input.description,
        dueDate: input.dueDate,
        clientIndustry: input.clientIndustry,
        contactEmail: input.contactEmail,
        priority: input.priority,
        estimatedValue: input.estimatedValue,
        currency: input.currency,
        tags: input.tags,
        status: RFPStatus.DRAFT,
        originalFileName: input.fileName,
        originalFileUrl: input.fileUrl,
        fileSize: input.fileSize,
        receivedAt: new Date(),
        organizationId,
        createdById: userId,
      },
      include: {
        organization: true,
        createdBy: true,
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        type: 'RFP_CREATED',
        description: `Created RFP: ${rfp.title}`,
        userId,
        rfpId: rfp.id,
        metadata: {
          clientName: input.clientName,
          fileName: input.fileName,
        },
      },
    });

    // Trigger Inngest job to parse RFP document and extract questions
    await inngest.send({
      name: 'rfp/parse-document',
      data: {
        rfpId: rfp.id,
        fileUrl: input.fileUrl,
        fileName: input.fileName,
      },
    });

    return rfp;
  });


// Get RFP statistics
export const getStats = authed
  .handler(async ({ context }) => {
    const organizationId = context.auth.organizationCode;

    const [
      total,
      draft,
      inProgress,
      review,
      submitted,
      won,
      lost,
    ] = await Promise.all([
      prisma.rFP.count({ where: { organizationId } }),
      prisma.rFP.count({ where: { organizationId, status: RFPStatus.DRAFT } }),
      prisma.rFP.count({ where: { organizationId, status: RFPStatus.IN_PROGRESS } }),
      prisma.rFP.count({ where: { organizationId, status: RFPStatus.REVIEW } }),
      prisma.rFP.count({ where: { organizationId, status: RFPStatus.SUBMITTED } }),
      prisma.rFP.count({ where: { organizationId, status: RFPStatus.WON } }),
      prisma.rFP.count({ where: { organizationId, status: RFPStatus.LOST } }),
    ]);

    // Get overdue RFPs
    const overdue = await prisma.rFP.count({
      where: {
        organizationId,
        dueDate: { lt: new Date() },
        status: { notIn: [RFPStatus.SUBMITTED, RFPStatus.WON, RFPStatus.LOST] },
      },
    });

    // Get upcoming deadlines (next 7 days)
    const upcoming = await prisma.rFP.count({
      where: {
        organizationId,
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        status: { notIn: [RFPStatus.SUBMITTED, RFPStatus.WON, RFPStatus.LOST] },
      },
    });

    return {
      total,
      byStatus: {
        draft,
        inProgress,
        review,
        submitted,
        won,
        lost,
      },
      overdue,
      upcoming,
    };
  });

// Helper function to upload file (implement based on your storage solution)
async function uploadFile(file: { 
  name: string; 
  type: string; 
  size: number; 
  data: string; 
}): Promise<string> {
  // TODO: Implement file upload to your storage solution
  // Example for Supabase Storage:
  
  // const { data: uploadData, error } = await supabase.storage
  //   .from('rfp-documents')
  //   .upload(`${Date.now()}-${file.name}`, Buffer.from(file.data, 'base64'), {
  //     contentType: file.type,
  //   });
  
  // if (error) throw error;
  // return uploadData.path;
  
  // For now, return a placeholder
  return `https://storage.example.com/rfps/${Date.now()}-${file.name}`;
}