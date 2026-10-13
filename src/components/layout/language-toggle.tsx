"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages, Loader2 } from "lucide-react";
import { setLocale } from "@/actions/locale";
import { useLocale } from "@/i18n/client";
import { cn } from "@/lib/utils";

/**
 * One tap switches the whole site between English and Hindi. Each label is
 * written in its own language so people can find it without reading English.
 */
export function LanguageToggle({ className, tone = "light", compact }: { className?: string; tone?: "light" | "dark"; compact?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next = locale === "hi" ? "en" : "hi";
  return (
    <button
      type="button"
      lang={next === "hi" ? "hi" : "en"}
      onClick={() =>
        startTransition(async () => {
          await setLocale(next);
          router.refresh();
        })
      }
      disabled={pending}
      aria-label={next === "hi" ? "हिंदी में देखें (View in Hindi)" : "View in English (अंग्रेज़ी में देखें)"}
      className={cn(
        "press inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-sm font-bold transition-colors",
        tone === "dark" ? "border-white/40 text-white hover:bg-white/10" : "border-border bg-white text-navy hover:border-primary/40 hover:text-primary",
        className,
      )}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        // In tight headers the icon only shows from tablet width; the label always shows.
        <Languages className={cn("size-4", compact && "hidden sm:block")} aria-hidden="true" />
      )}
      {next === "hi" ? "हिंदी" : "English"}
    </button>
  );
}
