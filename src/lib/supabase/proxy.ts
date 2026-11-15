import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/env";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile",
  "/donations",
  "/requests",
  "/notifications",
  "/settings",
  "/volunteer",
  "/admin",
  "/share-your-story/submissions",
];

/** Staff-only areas: never advertised, so signed-out visitors get a 404, not a login prompt. */
const HIDDEN_PREFIXES = ["/volunteer", "/admin", "/api/admin"];

export function isHiddenPath(pathname: string): boolean {
  return HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function notFoundResponse(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/not-found";
  url.search = "";
  return NextResponse.rewrite(url, { status: 404 });
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * Refreshes the Supabase session cookie and redirects anonymous visitors away
 * from private areas. Role checks happen in server layouts, server actions and
 * database RLS — this is only the first gate.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured()) {
    if (isHiddenPath(request.nextUrl.pathname)) return notFoundResponse(request);
    if (isProtectedPath(request.nextUrl.pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  // Do not run code between createServerClient and getClaims().
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  const path = request.nextUrl.pathname;
  if (isHiddenPath(path)) {
    if (!signedIn) return notFoundResponse(request);
    // Answer with a real 404 before any page streams. Layouts, actions and RLS
    // still enforce the same rule; this only keeps the areas unadvertised.
    const { data: role } = await supabase
      .from("staff_roles")
      .select("role")
      .eq("user_id", String(data?.claims?.sub))
      .eq("is_active", true)
      .maybeSingle();
    const adminArea = path.startsWith("/admin") || path.startsWith("/api/admin");
    if (!role || (adminArea && role.role !== "admin")) return notFoundResponse(request);
  }
  if (!signedIn && isProtectedPath(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }

  // Private pages must never be stored by shared caches.
  if (isProtectedPath(request.nextUrl.pathname)) {
    response.headers.set("Cache-Control", "private, no-store");
  }
  return response;
}
