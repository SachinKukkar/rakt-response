import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/redirects";

/**
 * PKCE code exchange (used by Supabase's default email templates).
 * Supabase only issues a code after it has verified the email link, so if the
 * exchange fails (typically: the link was opened on a different device or
 * browser than the one used to sign up) the email IS confirmed — we just can't
 * start a session here. Say so clearly instead of "link expired".
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"), "/dashboard?welcome=1");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
    if (next.startsWith("/reset-password")) {
      return NextResponse.redirect(new URL("/forgot-password?error=device", origin));
    }
    return NextResponse.redirect(new URL("/login?notice=confirmed", origin));
  }
  return NextResponse.redirect(new URL("/login?error=link", origin));
}
