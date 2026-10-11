/** Public configuration. NEXT_PUBLIC_* values are inlined at build time. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const mapEnabled = process.env.NEXT_PUBLIC_ENABLE_MAP !== "false";

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("your-project-ref"));
}

/** Public URL of an approved story photo in the public bucket. */
export function publicStoryPhotoUrl(path: string | null | undefined): string | null {
  if (!path || !supabaseUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/story-public/${encodeURIComponent(path)}`;
}
