import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

/**
 * Runs only where the session is read. Public education pages stay static and
 * never touch the auth service (keeps free-tier usage and latency low).
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/donations/:path*",
    "/requests/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/volunteer/:path*",
    "/admin/:path*",
    "/share-your-story/:path*",
    "/blood-requests/new",
    "/login",
    "/register",
    "/reset-password",
    "/auth/:path*",
    "/api/:path*",
  ],
};
