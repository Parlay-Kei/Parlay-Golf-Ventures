import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { securityMiddleware } from '@/lib/auth/security-headers';

// List of paths that don't require authentication
const publicPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/auth/verify-email',
  '/api/auth',
];

export async function middleware(request: NextRequest) {
  // Apply security headers
  const response = securityMiddleware(request);

  // Check if the path requires authentication
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));
  
  if (!isPublicPath) {
    // Get the session token from the cookie
    const session = request.cookies.get('sb-access-token');
    
    if (!session) {
      // Redirect to login if no session is found
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 