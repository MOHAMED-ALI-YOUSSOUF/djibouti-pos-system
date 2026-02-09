import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function middleware(req: NextRequest) {
    const { data: { session } } = await supabaseServer.auth.getSession();

    if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Fetch role for finer RBAC (e.g., redirect if cashier accesses /inventory)
    if (session) {
        const { data: user } = await supabaseServer.from('users').select('roles(name)').eq('id', session.user.id).single();
        const role = user?.roles?.[0]?.name;
        if (role !== 'admin' && req.nextUrl.pathname.startsWith('/dashboard/inventory')) {
            return NextResponse.redirect(new URL('/dashboard/pos', req.url));
        }
        // Add more route checks as needed
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/dashboard/:path*',
};