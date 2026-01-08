
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      clerkUserId: 'user_2ozM8j...test', // Mock Clerk ID
    },
  })

  const org = await prisma.organization.upsert({
    where: { slug: 'test-org' },
    update: {},
    create: {
      name: 'Test Organization',
      slug: 'test-org',
    },
  })

  // Link user to org
  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: org.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      organizationId: org.id,
      role: 'OWNER',
    },
  })

  const rfp = await prisma.rFP.create({
    data: {
      title: 'Example RFP for AI Services',
      clientName: 'Acme Corp',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      description: 'Request for proposal for AI-powered document processing solution.',
      organizationId: org.id,
      createdById: user.id,
      questions: {
          create: [
              {
                  questionText: "Describe your experience with LLMs.",
                  questionNumber: "1.1",
                  status: "PENDING"
              },
              {
                  questionText: "What represents your security compliance?",
                  questionNumber: "1.2",
                  status: "PENDING"
              }
          ]
      }
    },
  })

  console.log({ rfpId: rfp.id })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
