import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/redirects";

const ALLOWED_TYPES: EmailOtpType[] = ["signup", "email", "recovery", "email_change", "invite", "magiclink"];

/**
 * Email links (signup confirmation, password recovery, email change) using the
 * token-hash template: {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=...
 * Works even when the link is opened on a different device from signup.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const defaultNext = type === "recovery" ? "/reset-password" : "/dashboard?welcome=1";
  const next = safeNextPath(searchParams.get("next"), defaultNext);

  if (tokenHash && type && ALLOWED_TYPES.includes(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(new URL(type === "recovery" ? "/reset-password" : next, origin));
    }
  }
  return NextResponse.redirect(new URL("/login?error=link", origin));
}
