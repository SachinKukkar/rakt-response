import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ActionForm } from "@/components/common/action-form";
import { Notice, SectionHeading } from "@/components/common/page-parts";
import { reportMyDonation } from "@/actions/requests";
import type { DonationCheck } from "@/lib/data/member";
import { formatDate, todayInIndia } from "@/lib/format";
import { getT } from "@/i18n/server";

/** The same aftercare points as the donation process page. */
const AFTERCARE = [
  ["Drink extra", "Keep sipping fluids for the rest of the day."],
  ["Go easy", "No heavy exercise or lifting with that arm today."],
  ["Bandage on", "Keep it on a few hours. Bleeding? Press firmly, raise your arm."],
  ["When to contact the blood centre", "You feel unwell in the hours or days after donating."],
] as const;

/**
 * For a request the donor joined: "Did you donate?" (which adds the donation to their
 * record and starts a Rakt Mitra's follow-up), or a thank-you once they have.
 */
export async function DonationReport({ check }: { check: DonationCheck }) {
  const t = await getT();
  const today = todayInIndia();
  if (check.outcome === "donated") {
    const inRecord = Boolean(check.donation_record_id);
    return (
      <Notice tone="brand" icon={HeartHandshake} title={t("Thank you for donating")}>
        <p>
          {inRecord
            ? t("You gave blood for this request on {date}. It's in your donation record, and a Rakt Mitra may check in with you.", {
                date: formatDate(check.donated_on),
              })
            : t("A Rakt Mitra recorded your donation for this request. Add it to your donation record so we know when you can give again.")}
        </p>
        {!inRecord && check.can_report ? (
          <ActionForm
            action={reportMyDonation}
            fields={{ request_id: check.request_id, donated: "true" }}
            label="Add to my record"
            size="sm"
            className="mt-3 flex flex-wrap items-end gap-3 space-y-0"
            hideAfterSuccess
          >
            <label className="space-y-1 text-sm font-semibold text-navy">
              <span className="block">{t("Day you donated")}</span>
              <Input type="date" name="donation_date" defaultValue={check.donated_on ?? today} max={today} required className="w-44" />
            </label>
          </ActionForm>
        ) : null}
        <ul className="mt-2 space-y-1">
          {AFTERCARE.map(([title, text]) => (
            <li key={title}>
              <strong className="text-navy">{t(title)}:</strong> {t(text)}
            </li>
          ))}
        </ul>
        <Link href="/donations" className="mt-2 inline-flex min-h-11 items-center font-semibold text-primary underline">
          {t("See my donation history")}
        </Link>
      </Notice>
    );
  }
  if (!check.can_report) return null;

  const neededOn = todayInIndia(new Date(check.required_by));
  return (
    <section id="donated" className="surface scroll-mt-24 space-y-4 p-5" aria-labelledby="donated-heading">
      <SectionHeading
        id="donated-heading"
        title="Did you donate?"
        description="Tell us after you give blood for this request. We add it to your donation record, which updates when you can give again, and a Rakt Mitra checks in on you."
        as="h3"
      />
      <ActionForm
        action={reportMyDonation}
        fields={{ request_id: check.request_id, donated: "true" }}
        label="Yes, I donated"
        className="flex flex-wrap items-end gap-3 space-y-0"
        hideAfterSuccess
      >
        <label className="space-y-1 text-sm font-semibold text-navy">
          <span className="block">{t("Day you donated")}</span>
          <Input type="date" name="donation_date" defaultValue={neededOn < today ? neededOn : today} max={today} required className="w-44" />
        </label>
      </ActionForm>
      {/* Before the needed-by time, "I can't donate after all" (leaving the request) covers no. */}
      {check.ask_now ? (
        <ActionForm
          action={reportMyDonation}
          fields={{ request_id: check.request_id, donated: "false" }}
          label="No, I didn't donate"
          variant="ghost"
          size="sm"
          hideAfterSuccess
        />
      ) : null}
    </section>
  );
}
