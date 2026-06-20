import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const authRoutes = ['/auth/login', '/auth/register'];
const adminRoutes = ['/admin'];
const organizerRoutes = ['/events/create', '/dashboard'];

function decodeToken(token: string): { role?: string; isApprovedOrganizer?: string } | null {
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return {
            role: decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
            isApprovedOrganizer: decoded.isApprovedOrganizer,
        };
    } catch {
        return null;
    }
}

export function proxy(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value;
    const { pathname } = request.nextUrl;

    if (token && authRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (adminRoutes.some(route => pathname.startsWith(route))) {
        if (!token) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
        const payload = decodeToken(token);
        if (!payload || payload.role !== 'Admin') {
            return NextResponse.redirect(new URL('/access-denied', request.url));
        }
        return NextResponse.next();
    }

    if (organizerRoutes.some(route => pathname.startsWith(route))) {
        if (!token) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
        const payload = decodeToken(token);
        if (!payload) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
        if (pathname.startsWith('/events/create')) {
            const isOrganizer = payload.role === 'Organizer' && payload.isApprovedOrganizer === 'True';
            const isAdmin = payload.role === 'Admin';
            if (!isOrganizer && !isAdmin) {
                return NextResponse.redirect(new URL('/access-denied', request.url));
            }
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
