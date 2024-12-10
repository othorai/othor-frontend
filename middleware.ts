import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Allow public paths
  const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  // Special check for verification with token
  const isVerificationPath = pathname === '/verification';
  const hasVerificationToken = searchParams.has('token');

  // Get token from cookies or authorization header
  const token = request.cookies.get('authToken')?.value || 
                request.headers.get('authorization')?.split(' ')[1];

  // Allow verification page with token
  if (isVerificationPath && hasVerificationToken) {
    return NextResponse.next();
  }

  // If on a public path and have token, redirect to home
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // If on a private path and no token, redirect to login
  if (!isPublicPath && !token && !isVerificationPath) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};