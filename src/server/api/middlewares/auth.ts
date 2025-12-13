import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ORPCError, os } from "@orpc/server";

export interface User {
  id: string;
  email: string;
  phone: string | null;
  fullName: string | null;
  avatar: string | null;
}

// Kinde --> Our App User Mapper
async function auth(): Promise<User | null> {
  const { getUser } = await getKindeServerSession();
  const u = await getUser();

  if (!u) return null;

  return {
    id: u.id,
    email: u.email ?? "",
    phone: u.phone_number ?? null,
    fullName: `${u.given_name ?? ""} ${u.family_name ?? ""}`.trim(),
    avatar: u.picture ?? null,
  };
}

const requireAuthMiddleware = os
  .$context<{ user?: User }>()
  .middleware(async ({ context, next }) => {
    const user = context.user ?? (await auth());

    if (!user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    return next({
      context: { user },
    });
  });

export const authed = os.use(requireAuthMiddleware);