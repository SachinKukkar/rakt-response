import { Quote } from "lucide-react";
import { SampleNote, SectionHeading } from "@/components/common/page-parts";
import { SAMPLE_TESTIMONIALS, SHOW_SAMPLES } from "@/lib/samples";
import { cn } from "@/lib/utils";
import { getLocale, getT } from "@/i18n/server";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part.replace(/[^\p{L}]/gu, "").charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Short quotes from donors, families and volunteers. Until real quotes are
 * collected (with consent) these are the samples in src/lib/samples.ts, each
 * labelled "Sample"; the section disappears when samples are switched off.
 */
export async function TestimonialsSection({ className }: { className?: string }) {
  if (!SHOW_SAMPLES || SAMPLE_TESTIMONIALS.length === 0) return null;
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return (
    <section className={cn("section", className)} aria-labelledby="voices-heading">
      <div className="page-container">
        <SectionHeading size="lg" id="voices-heading" title="What people say" description="Donors, families and volunteers on using Rakt Response." />
        <ul className="snap-row lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0">
          {SAMPLE_TESTIMONIALS.map((item, i) => (
            <li key={item.name} className="w-[86%] min-[480px]:w-[62%] sm:w-[46%] lg:w-auto">
              <figure className="surface lg:reveal flex h-full flex-col p-6 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <Quote className="size-8 fill-primary/10 text-primary/40" aria-hidden="true" />
                  <span className="tag">{t("Sample")}</span>
                </div>
                <blockquote className="mt-4 flex-1 text-base leading-relaxed text-foreground">{item.quote[locale]}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border/70 pt-5">
                  <span
                    className={cn("grid size-11 shrink-0 place-items-center rounded-full text-sm font-bold text-white", i % 2 ? "cover-navy" : "cover-red")}
                    aria-hidden="true"
                  >
                    {initials(item.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-navy">{item.name}</span>
                    <span className="block text-sm text-muted-foreground">
                      {item.role[locale]} · {item.city}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <SampleNote className="mt-5">These are sample quotes. Real ones will replace them as people share their experiences.</SampleNote>
      </div>
    </section>
  );
}
