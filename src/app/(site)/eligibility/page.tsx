import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarClock,
  Droplet,
  HeartPulse,
  Pill,
  Scale,
  Stethoscope,
  Thermometer,
  TriangleAlert,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { Notice, PageHeader } from "@/components/common/page-parts";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Eligibility",
  description:
    "General information about blood donation eligibility in India. This is not a medical assessment: the blood centre's doctor decides at every donation.",
};

const CRITERIA: { icon: LucideIcon; title: string; body: React.ReactNode }[] = [
  {
    icon: UserCheck,
    title: "Age",
    body: "Donors are typically between 18 and 65 years old. Some centres apply extra checks for first-time donors at the upper end of this range.",
  },
  {
    icon: Scale,
    title: "Weight",
    body: "A minimum body weight is usually required, typically around 45–50 kg. Larger collection volumes may need a higher minimum weight.",
  },
  {
    icon: Droplet,
    title: "Haemoglobin",
    body: "Your haemoglobin level needs to be adequate on the day. It is checked at the centre with a quick finger-prick or similar test.",
  },
  {
    icon: Thermometer,
    title: "Feeling well",
    body: "You should feel well on the day of donation. Fever, a cold, an upset stomach or recent illness can mean waiting until you have recovered.",
  },
  {
    icon: Pill,
    title: "Medicines, procedures and tattoos",
    body: "Certain medicines, vaccinations, surgeries, dental work, tattoos, piercings and some travel can each mean a waiting (deferral) period before you can donate.",
  },
  {
    icon: CalendarClock,
    title: "Time since your last donation",
    body: (
      <>
        Intervals differ by donation type. For whole blood, Indian guidance typically differs by sex, for example 90 days for
        men and 120 days for women. Apheresis donations such as SDP have their own, shorter intervals set by the apheresis
        centre.{" "}
        <Link href="/donation-types" className="font-medium text-primary underline underline-offset-4">
          Compare donation types
        </Link>
        .
      </>
    ),
  },
];

const ASK_CENTRE = [
  "Pregnancy, recent childbirth, breastfeeding or recent miscarriage",
  "Long-term health conditions, such as heart, lung, kidney or liver conditions, diabetes or high blood pressure",
  "Any medicines you are currently taking, including antibiotics or blood thinners",
  "Recent infections, including dengue, malaria, jaundice or hepatitis, and contact with people who had them",
  "Recent surgery, dental treatment, tattoos, piercings, acupuncture or vaccinations",
  "Anything else you are unsure about",
];

export default function EligibilityPage() {
  return (
    <div className="page-container py-8 sm:py-12">
      <PageHeader
        eyebrow="Learn"
        title="Eligibility information"
        description="General information about who can usually donate blood in India, so you know what to expect at a blood centre."
      />

      <Notice title="This is not a medical assessment" tone="warning" icon={TriangleAlert}>
        <p>
          This page shares general information only. <strong>Rakt Response does not decide who can donate.</strong> At every
          donation, the blood centre&apos;s doctor and staff carry out their own screening, and their decision is final.
          Registering on Rakt Response, or reading this page, does not mean you can donate on any particular day.
        </p>
      </Notice>

      <section aria-labelledby="guidelines-heading" className="mt-8">
        <div className="prose-rr max-w-3xl">
          <h2 id="guidelines-heading">Who sets the rules</h2>
          <p>
            In India, donor selection follows national guidelines from the{" "}
            <strong>National Blood Transfusion Council (NBTC)</strong> and the{" "}
            <strong>National AIDS Control Organisation (NACO)</strong>, along with the rules of each licensed blood centre.
            These guidelines are updated from time to time, and centres may apply additional checks.
          </p>
          <p>
            The doctor at the blood centre applies these guidelines to you as an individual, using your answers to the donor
            questionnaire and a short health check on the day.
          </p>
        </div>
      </section>

      <section aria-labelledby="criteria-heading" className="mt-10">
        <h2 id="criteria-heading" className="mb-1 text-lg font-bold sm:text-xl">
          Common general criteria
        </h2>
        <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
          These are typical requirements. They are not a checklist for deciding your own eligibility.
        </p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CRITERIA.map(({ icon: Icon, title, body }) => (
            <li key={title} className="surface p-5">
              <span className="mb-3 grid size-10 place-items-center rounded-full bg-accent text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="text-base font-bold">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="ask-heading" className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="surface p-5">
          <div className="mb-3 flex items-center gap-2">
            <Stethoscope className="size-5 text-primary" aria-hidden="true" />
            <h2 id="ask-heading" className="text-base font-bold sm:text-lg">
              Tell the blood centre about
            </h2>
          </div>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/85">
            {ASK_CENTRE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="surface p-5">
          <div className="mb-3 flex items-center gap-2">
            <HeartPulse className="size-5 text-primary" aria-hidden="true" />
            <h2 className="text-base font-bold sm:text-lg">Answer honestly, every time</h2>
          </div>
          <div className="space-y-3 text-sm leading-relaxed text-foreground/85">
            <p>
              The donor questionnaire protects both you and the patient. Answer every question honestly, even if you have
              donated many times before. Your answers are confidential to the blood centre.
            </p>
            <p>
              Being asked to wait is common and is not a judgement about you. A deferral is often temporary, and the centre can
              tell you when you may be able to return.
            </p>
            <p>
              SDP and other apheresis donations need additional checks, such as a platelet count and vein suitability, which the
              apheresis centre decides.
            </p>
          </div>
        </div>
      </section>

      <Notice title="Unsure about something?" className="mt-8">
        Please contact a licensed blood centre or speak to your own doctor. Rakt Response volunteers cannot give medical advice
        or confirm whether you can donate.
      </Notice>

      <section aria-labelledby="cta-heading" className="surface-tint mt-12 p-6 sm:p-8">
        <h2 id="cta-heading" className="text-xl font-bold">
          Next steps
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
          Register as a voluntary donor and read what to expect on the day. The blood centre will always carry out its own
          screening.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild>
            <Link href="/register">Become a Donor</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/donation-process">The donation process</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/faq">Read the FAQ</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
