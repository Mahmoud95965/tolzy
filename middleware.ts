import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Redirect non-www to www
    const host = request.headers.get('host');
    if (host === 'tolzy.me') {
        return NextResponse.redirect(`https://www.tolzy.me${pathname}`, {
            status: 301,
            headers: {
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    }

    // Redirect old domain to new domain
    if (host === 'neovex.vercel.app') {
        return NextResponse.redirect(`https://www.tolzy.me${pathname}`, {
            status: 301,
            headers: {
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
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
         * - common asset extensions (png, jpg, jpeg, gif, webp, svg, ico)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)',
    ],
};
