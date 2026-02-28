import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/pricing',
  '/forgot-password',
  '/reset-password',
  '/accept-invite',
];
const AUTH_ROUTES = ['/login', '/register'];
const PROTECTED_PREFIXES = ['/dashboard', '/admin'];

function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get('access-token')?.value ?? null;
}

// Next.js 16+: export name must be "proxy" (previously "middleware")
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = getTokenFromRequest(request);

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedRoute =
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) || pathname === '/';

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !isPublicRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|api).*)'],
};
