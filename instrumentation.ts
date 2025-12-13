export async function register() {
  // Only load in Node.js runtime, not edge runtime
  // This prevents Prisma from being loaded in edge contexts
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      await import('@/server/api/orpc.server');
    } catch (error) {
      console.error('Failed to load ORPC server:', error);
    }
  }
}