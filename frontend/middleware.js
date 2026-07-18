import { NextResponse } from 'next/server';
import { ROLES } from '@/constants/roles';
import {
  APP_ROUTES,
  AUTH_COOKIE,
  ROLE_COOKIE,
  PROTECTED_PREFIXES,
} from '@/constants/routes';

function isProtectedPath(pathname) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function startsWithPath(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value;

  if (isProtectedPath(pathname) && !token) {
    const loginUrl = new URL(APP_ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && role) {
    if (startsWithPath(pathname, APP_ROUTES.ADMIN.ROOT) && role !== ROLES.ADMIN) {
      return NextResponse.redirect(new URL(APP_ROUTES.CUSTOMER.ROOT, request.url));
    }

    if (
      startsWithPath(pathname, APP_ROUTES.CUSTOMER.ROOT) &&
      role === ROLES.ADMIN
    ) {
      return NextResponse.redirect(new URL(APP_ROUTES.ADMIN.ROOT, request.url));
    }
  }

  if (
    token &&
    (pathname === APP_ROUTES.LOGIN || pathname === APP_ROUTES.REGISTER)
  ) {
    if (role === ROLES.ADMIN) {
      return NextResponse.redirect(new URL(APP_ROUTES.ADMIN.ROOT, request.url));
    }
    if (role === ROLES.CUSTOMER) {
      return NextResponse.redirect(new URL(APP_ROUTES.CUSTOMER.ROOT, request.url));
    }
    // Token without role cookie — allow auth pages so client can restore or clear session
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/customer/:path*', '/login', '/register'],
};
