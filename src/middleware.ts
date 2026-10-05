import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/i18n/request';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip internal assets, static files, and public auth APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Extract locale and route path
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  const isLocale = SUPPORTED_LOCALES.includes(firstSegment as typeof SUPPORTED_LOCALES[number]);
  const locale = isLocale ? firstSegment : DEFAULT_LOCALE;
  const routePath = isLocale ? segments.slice(1).join('/') : segments.join('/');
  const isLandingPage = routePath === '' || routePath === 'page';

  // 3. Read Google login session cookie
  const authUserCookie = request.cookies.get('auth_user_email')?.value;
  const isAuthenticated = Boolean(authUserCookie && authUserCookie.trim().length > 0);

  // 4. Private Route Guard: If not logged in, block all routes and redirect to Google login landing page
  if (!isAuthenticated && !isLandingPage) {
    const loginUrl = new URL(`/${locale}`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 5. If already logged in and visiting Landing page, redirect to dashboard
  if (isAuthenticated && isLandingPage) {
    const dashboardUrl = new URL(`/${locale}/cash-book`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
