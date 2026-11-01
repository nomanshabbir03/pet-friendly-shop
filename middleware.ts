import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const protectedPrefixes = ['/admin'];

function getSessionSecret() {
  const sessionSecret = process.env.SESSION_SECRET?.trim();

  if (!sessionSecret && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be set in production to verify admin sessions.');
  }

  return sessionSecret;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login' || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (!protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin-session')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    const sessionSecret = getSessionSecret();
    if (!sessionSecret) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const secret = new TextEncoder().encode(sessionSecret);
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== 'admin' || typeof payload.username !== 'string') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
