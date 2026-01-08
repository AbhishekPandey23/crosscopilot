import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ORPCError, os } from "@orpc/server";
import prisma from "../../db/client";

const requireAuthMiddleware = os.middleware(async ({ context, next }) => {
  const { isAuthenticated, getOrganization, getUser } = getKindeServerSession();

  if (!(await isAuthenticated())) {
    throw new ORPCError("UNAUTHORIZED");
  }

  const user = await getUser();
  const organization = await getOrganization();
  const organizationId = organization?.orgCode;

  if (!user || !organizationId) {
    throw new ORPCError("UNAUTHORIZED");
  }

  // Ensure Organization exists in our DB (using Kinde orgCode as ID)
  const org = await prisma.organization.upsert({
    where: { id: organizationId },
    update: { name: organizationId }, // Use orgCode as name if name is not available
    create: { 
      id: organizationId, 
      name: organizationId,
      slug: organizationId.toLowerCase().replace(/\s+/g, '-'),
    }
  });

  // Ensure User exists in our DB (using Kinde ID as ID)
  await prisma.user.upsert({
    where: { id: user.id },
    update: { 
      email: user.email || "", 
      name: `${user.given_name || ""} ${user.family_name || ""}`.trim() || null 
    },
    create: { 
      id: user.id, 
      email: user.email || "", 
      name: `${user.given_name || ""} ${user.family_name || ""}`.trim() || null,
      clerkUserId: user.id, // Reusing Kinde ID for this required field
    }
  });

  return next({
    context: {
      auth: {
        kindeUserId: user.id,
        organizationCode: org.id,
      },
    },
  });
});

export const authed = os.use(requireAuthMiddleware);