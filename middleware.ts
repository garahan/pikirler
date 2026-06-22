import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth wall: visitors with no session cookie are sent to /login first.
// API routes (incl. cron + admin, which use their own secrets) are excluded
// via the matcher below, so external callers and auth endpoints still work.
export function middleware(req: NextRequest) {
  const hasSession = !!req.cookies.get('token')?.value;
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // run on all page routes EXCEPT these
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|manifest.json|robots.txt).*)'],
};
