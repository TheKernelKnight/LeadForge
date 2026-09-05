import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token');
  const path = request.nextUrl.pathname;
  
  // Public paths that don't need authentication
  const isAuthPage = path.startsWith('/auth/');
  const isPublicPath = path === '/' || path.startsWith('/_next') || path.startsWith('/api');
  
  // If trying to access auth page while logged in -> redirect to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // If trying to access protected page while logged out -> redirect to login
  if (!token && !isPublicPath && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};