import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import prisma from "@/server/db/client"

export async function vendorType() {
    const { getUser } = await getKindeServerSession();
    const user = await getUser();
    if (!user) {
        return null;
    }
    
    // Cache the vendor type for 5 minutes per user
    const vendorData =   await (prisma as any).user.findUnique({
                where: { id: user.id },
                select: { vendorType: true },
            });
    return vendorData?.vendorType?.toLowerCase() ?? 'individual';
}