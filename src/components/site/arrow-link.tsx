import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  /** Red pill, white arrow disc: the main action on any background. */
  /** On a red (.on-night) section it turns cream automatically (see globals.css). */
  red: { pill: "al-red bg-primary text-white hover:bg-[#b32323]", disc: "al-disc bg-white text-primary" },
  /** Cream pill for dark sections. */
  cream: { pill: "bg-cream text-night hover:bg-white", disc: "bg-primary text-white" },
  /** Dark pill for cream sections. */
  night: { pill: "bg-night text-cream hover:bg-night-2", disc: "bg-primary text-white" },
  /** Quiet outline on dark backgrounds. */
  ghost: { pill: "border border-white/20 bg-white/5 text-cream backdrop-blur hover:bg-white/10", disc: "bg-white/12 text-cream" },
  /** Quiet outline on cream backgrounds. */
  line: { pill: "border border-navy/15 bg-transparent text-navy hover:bg-navy/5", disc: "bg-navy/8 text-navy" },
} as const;

/**
 * A rounded call-to-action with a round arrow at the end. The arrow nudges
 * right on hover. Pass `arrow={false}` for a plain pill.
 */
export function ArrowLink({
  href,
  children,
  tone = "red",
  size = "md",
  arrow = true,
  className,
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  tone?: keyof typeof TONES;
  size?: "md" | "lg";
  arrow?: boolean;
  className?: string;
} & Omit<React.ComponentProps<typeof Link>, "href" | "children" | "className">) {
  const t = TONES[tone];
  return (
    <Link
      href={href}
      className={cn(
        "group/arrow press inline-flex shrink-0 items-center rounded-full font-medium whitespace-nowrap transition-colors duration-300",
        size === "lg" ? "h-14 gap-4 text-base" : "h-12 gap-3 text-[15px]",
        arrow ? (size === "lg" ? "pr-2 pl-6" : "pr-1.5 pl-5") : "px-6",
        t.pill,
        className,
      )}
      {...rest}
    >
      {children}
      {arrow ? (
        <span
          aria-hidden="true"
          className={cn(
            "grid place-items-center rounded-full transition-transform duration-300 group-hover/arrow:translate-x-0.5",
            size === "lg" ? "size-10" : "size-9",
            t.disc,
          )}
        >
          <ArrowRight className="size-4" />
        </span>
      ) : null}
    </Link>
  );
}
