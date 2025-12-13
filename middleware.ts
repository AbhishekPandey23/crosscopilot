import { withAuth } from '@kinde-oss/kinde-auth-nextjs/middleware';
import { NextRequest, NextResponse } from 'next/server';

export default withAuth(
  async function middleware(req: NextRequest & { kindeAuth: any }) {
    const { pathname } = req.nextUrl;

    // Public paths that don't require auth
    const publicPaths = ['/'];
    const isPublicPath = publicPaths.includes(pathname);

    // Auth paths
    const isAuthPath = pathname.startsWith('/api/auth');

    // Allow public and auth paths
    if (isPublicPath || isAuthPath) {
      return NextResponse.next();
    }

    // For all other paths, Kinde middleware will handle auth
    // The page-level checks will handle onboarding redirects
    return NextResponse.next();
  },
  {
    // Middleware still runs on all routes, but doesn't protect these specific routes
    publicPaths: ['/'],
  }
);

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
