import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/events/create', '/admin'];
const authRoutes = ['/auth/login', '/auth/register'];

export function proxy(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value;
    const { pathname } = request.nextUrl;

    if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (token && authRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};