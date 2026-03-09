import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/signals",
  "/positions",
  "/coins",
  "/announcements",
  "/preferences",
  "/config",
  "/manual-scan",
  "/profile",
];

export async function updateSession(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return NextResponse.next({ request });
    }

    let response = NextResponse.next({ request });

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const isProtected = PROTECTED_PATHS.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );

    if (isProtected && !user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirect", pathname);
      return Response.redirect(redirectUrl);
    }

    return response;
  } catch {
    return NextResponse.next({ request });
  }
}
