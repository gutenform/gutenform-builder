import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

const DASHBOARD_PREFIX = '/app';
const ADMIN_PREFIX = '/admin';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isDashboard = request.nextUrl.pathname.startsWith(DASHBOARD_PREFIX);
  const isAdmin = request.nextUrl.pathname.startsWith(ADMIN_PREFIX);

  if (isDashboard || isAdmin) {
    if (!session) {
      const redirect = new URL('/login', request.url);
      redirect.searchParams.set('redirectTo', request.nextUrl.pathname);
      return NextResponse.redirect(redirect);
    }
  }

  if (isAdmin && session) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey) {
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
      );
      const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/app', request.url));
      }
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/app', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/app/:path*', '/admin/:path*'],
};
