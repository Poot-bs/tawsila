import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * Next.js 16 Proxy function (formerly middleware)
 */
export function proxy(request: NextRequest) {
  return intlMiddleware(request);
}

/**
 * Default export is still required for some Next.js 16 builds
 * but the named 'proxy' export is the new convention.
 */
export default proxy;

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
