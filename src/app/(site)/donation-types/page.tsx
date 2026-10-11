import type { Metadata } from "next";
import Link from "next/link";
import { Droplet, Droplets, Layers, ListChecks, Microscope, Repeat } from "lucide-react";
import { Notice, PageHeader } from "@/components/common/page-parts";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Donation types",
  description:
    "Whole blood, Single Donor Platelet (SDP) and other apheresis donations explained: how they differ, how long they take, and why they are not interchangeable.",
};

type Row = { label: string; value: string };

const TYPES: { id: string; name: string; short: string; rows: Row[] }[] = [
  {
    id: "whole-blood",
    name: "Whole blood",
    short: "The most common type of donation.",
    rows: [
      { label: "How it is collected", value: "One needle in one arm. Blood flows into a sterile, single-use collection bag." },
      { label: "Amount collected", value: "Typically around 350–450 ml, depending on the bag used and your weight." },
      { label: "Collection time", value: "Roughly 10–15 minutes for the collection itself, plus registration, screening and rest." },
      { label: "What it becomes", value: "Usually separated at the blood centre into red cells, plasma and sometimes platelets." },
      { label: "Interval between donations", value: "Longest of the three, because red cells take time to replace. The blood centre will advise." },
      { label: "Extra checks", value: "Standard screening: questionnaire, haemoglobin, weight, pulse, blood pressure and temperature." },
    ],
  },
  {
    id: "sdp",
    name: "Single Donor Platelets (SDP)",
    short: "Also called plateletpheresis.",
    rows: [
      {
        label: "How it is collected",
        value: "A cell separator machine draws blood, keeps the platelets and returns the rest of your blood to you.",
      },
      { label: "Amount collected", value: "A platelet dose that would otherwise need to be pooled from several whole-blood donations." },
      { label: "Collection time", value: "Longer than whole blood, typically 60–90 minutes or more on the machine." },
      { label: "What it becomes", value: "A platelet unit, often for patients with very low platelet counts." },
      { label: "Interval between donations", value: "Shorter than whole blood, as platelets are replaced more quickly. The centre sets limits." },
      {
        label: "Extra checks",
        value: "Usually a platelet count and a check that your arm veins are suitable, decided by the apheresis centre.",
      },
    ],
  },
  {
    id: "other-apheresis",
    name: "Other apheresis (e.g. plasma)",
    short: "Offered only at some centres.",
    rows: [
      {
        label: "How it is collected",
        value: "Similar to SDP: a machine collects one component, such as plasma, and returns the rest.",
      },
      { label: "Amount collected", value: "Depends on the component and the centre's protocol." },
      { label: "Collection time", value: "Longer than whole blood; the centre will tell you what to expect." },
      { label: "What it becomes", value: "A specific component, such as plasma for patient care." },
      { label: "Interval between donations", value: "Set by the centre according to the component collected and national guidelines." },
      { label: "Extra checks", value: "Additional tests may be needed, depending on the component." },
    ],
  },
];

export default function DonationTypesPage() {
  return (
    <div className="page-container py-8 sm:py-12">
      <PageHeader
        eyebrow="Learn"
        title="Types of blood donation"
        description="Whole blood, Single Donor Platelets (SDP) and other apheresis donations help patients in different ways. Here is how they compare."
      />

      <Notice title="Not interchangeable" tone="brand">
        A request for SDP cannot be met by a whole-blood donation, and a whole-blood request is not the same as a platelet
        request. When you respond to a request on Rakt Response, please check which type is needed.
      </Notice>

      <section aria-labelledby="overview-heading" className="mt-8">
        <div className="prose-rr max-w-3xl">
          <h2 id="overview-heading">Two ways to collect blood</h2>
          <p>
            In a <strong>whole-blood donation</strong>, blood is collected into a bag and later separated into components at the
            blood centre. In an <strong>apheresis donation</strong>, a machine separates your blood during the donation, keeps
            one component (such as platelets or plasma) and returns the rest to you through the same or a second needle.
          </p>
          <p>
            Because apheresis collects a larger amount of one component from a single person, one SDP donation can provide a
            platelet dose that would otherwise need to be pooled from several whole-blood donations. This can mean fewer donor
            exposures for the patient.
          </p>
        </div>
      </section>

      <section aria-labelledby="compare-heading" className="mt-10">
        <h2 id="compare-heading" className="mb-1 text-lg font-bold sm:text-xl">
          At a glance
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          General information only. Exact amounts, times and intervals depend on the blood centre and national guidelines.
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          {TYPES.map((t, i) => {
            const Icon = i === 0 ? Droplet : i === 1 ? Droplets : Layers;
            return (
              <article key={t.id} aria-labelledby={`${t.id}-title`} className="surface flex flex-col p-5">
                <div className="mb-3 flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 id={`${t.id}-title`} className="text-base font-bold">
                      {t.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{t.short}</p>
                  </div>
                </div>
                <dl className="divide-y divide-border/70 text-sm">
                  {t.rows.map((r) => (
                    <div key={r.label} className="py-2.5">
                      <dt className="text-xs font-semibold tracking-wide text-navy uppercase">{r.label}</dt>
                      <dd className="mt-0.5 leading-relaxed text-foreground/85">{r.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="differ-heading" className="mt-10 grid gap-4 lg:grid-cols-3">
        <h2 id="differ-heading" className="sr-only">
          Why eligibility and intervals differ
        </h2>
        <div className="surface p-5">
          <div className="mb-2 flex items-center gap-2">
            <Repeat className="size-5 text-primary" aria-hidden="true" />
            <h3 className="text-base font-bold">Why intervals differ</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your body replaces different components at different speeds. Red cells take weeks to rebuild, so whole-blood
            donations need longer gaps. Platelets and plasma are replaced faster, so apheresis intervals are shorter, within
            limits set by the centre.
          </p>
        </div>
        <div className="surface p-5">
          <div className="mb-2 flex items-center gap-2">
            <Microscope className="size-5 text-primary" aria-hidden="true" />
            <h3 className="text-base font-bold">Extra checks for SDP</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Apheresis centres usually check your platelet count and whether your veins are suitable for the machine before an
            SDP donation. Some people who can give whole blood may not be suitable for SDP, and the apheresis centre makes that
            decision.
          </p>
        </div>
        <div className="surface p-5">
          <div className="mb-2 flex items-center gap-2">
            <ListChecks className="size-5 text-primary" aria-hidden="true" />
            <h3 className="text-base font-bold">Plan for the time</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            An apheresis session takes much longer than a whole-blood donation. If you agree to an SDP request, keep a few hours
            free for screening, the donation itself and rest afterwards.
          </p>
        </div>
      </section>

      <Notice className="mt-8">
        This page is general information, not medical advice. Rakt Response does not decide who can donate. The blood centre or
        apheresis centre&apos;s doctor makes the final decision for each donation. See{" "}
        <Link href="/eligibility" className="font-medium text-primary underline underline-offset-4">
          general eligibility information
        </Link>
        .
      </Notice>

      <section aria-labelledby="cta-heading" className="surface-tint mt-12 p-6 sm:p-8">
        <h2 id="cta-heading" className="text-xl font-bold">
          Ready to help?
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
          Register as a voluntary donor. Each request on Rakt Response states the type of donation needed, and your donation
          history records whole blood and SDP separately.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild>
            <Link href="/register">Become a Donor</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/blood-requests">Find Blood</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/donation-process">What to expect</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
