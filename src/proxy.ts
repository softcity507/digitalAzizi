import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/i18n/request';

const PUBLIC_FILE = /\.(.*)$/;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip internal assets, static files, and public auth APIs.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  const isLocale = SUPPORTED_LOCALES.includes(firstSegment as typeof SUPPORTED_LOCALES[number]);
  const locale = isLocale ? firstSegment : DEFAULT_LOCALE;
  const routePath = isLocale ? segments.slice(1).join('/') : segments.join('/');
  const isLandingPage = routePath === '' || routePath === 'page';

  const authUserCookie = request.cookies.get('auth_user_email')?.value;
  const isAuthenticated = Boolean(authUserCookie && authUserCookie.trim().length > 0);

  if (isAuthenticated && !isLandingPage) {
    try {
      const sessionResponse = await fetch(new URL('/api/auth/me', request.url), {
        headers: { cookie: request.headers.get('cookie') || '' },
        cache: 'no-store',
      });
      if (sessionResponse.status === 403) {
        const loginUrl = new URL(`/${locale}`, request.url);
        loginUrl.searchParams.set('auth_error', 'Your free trial has ended. Contact the administrator to request more subscription days.');
        if (authUserCookie) loginUrl.searchParams.set('expired_email', authUserCookie);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('auth_user_email');
        response.cookies.delete('auth_user_role');
        return response;
      }
      if (!sessionResponse.ok) {
        const loginUrl = new URL(`/${locale}`, request.url);
        loginUrl.searchParams.set('auth_error', 'Could not verify subscription. Please try again.');
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL(`/${locale}`, request.url);
      loginUrl.searchParams.set('auth_error', 'Could not verify subscription. Please try again.');
      return NextResponse.redirect(loginUrl);
    }
  }

  if (!isAuthenticated && !isLandingPage) {
    const loginUrl = new URL(`/${locale}`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

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
