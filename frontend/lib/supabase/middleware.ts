import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // Local JWT verification (JWKS-cached). Avoids a remote Auth getUser() RTT
  // on every navigation — the main cause of 300–700ms proxy latency.
  const { data: claimsData } = await supabase.auth.getClaims();
  const authenticated = Boolean(claimsData?.claims?.sub);

  const pathname = request.nextUrl.pathname;
  const isLoginRoute = pathname === "/login";
  const isProtectedRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/organizations" ||
    pathname.startsWith("/organizations/") ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/");

  if (isProtectedRoute && !authenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isLoginRoute && authenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/organizations";
    url.search = "";
    const redirectResponse = NextResponse.redirect(url);
    // Avoid bfcache showing a stale login screen after Back.
    redirectResponse.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate",
    );
    return redirectResponse;
  }

  if (isLoginRoute) {
    supabaseResponse.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate",
    );
  }

  return supabaseResponse;
}
