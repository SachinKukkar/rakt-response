import type { Metadata } from "next";
import Link from "next/link";
import {
  Ambulance,
  Baby,
  Droplet,
  FlaskConical,
  HandHeart,
  HeartPulse,
  Hospital,
  Hourglass,
  Repeat,
  Ribbon,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { Notice, PageHeader } from "@/components/common/page-parts";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Why donate",
  description:
    "Why voluntary blood donation matters: how red cells, platelets and plasma support patients, and why regular voluntary donors are important.",
};

const COMPONENTS: { name: string; summary: string; uses: string }[] = [
  {
    name: "Red cells",
    summary: "Carry oxygen around the body.",
    uses: "Often used when a person has lost blood through injury, surgery or childbirth, or has severe anaemia.",
  },
  {
    name: "Platelets",
    summary: "Help blood to clot and stop bleeding.",
    uses: "Often needed by people whose platelet count is low, for example during some cancer treatments or in certain illnesses such as severe dengue, as decided by their doctors.",
  },
  {
    name: "Plasma",
    summary: "The liquid part of blood, containing proteins that help with clotting.",
    uses: "May be used for some bleeding and clotting problems, and certain medicines are made from donated plasma.",
  },
];

const NEEDS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Ambulance,
    title: "Emergency and trauma care",
    body: "People injured in road accidents or other emergencies may need blood quickly while doctors treat their injuries.",
  },
  {
    icon: Hospital,
    title: "Surgery",
    body: "Some planned and emergency operations, such as major heart or orthopaedic surgery, may involve blood transfusion.",
  },
  {
    icon: Baby,
    title: "Maternal care",
    body: "Heavy bleeding around childbirth can be serious, and blood may be an important part of a mother's care.",
  },
  {
    icon: Ribbon,
    title: "Cancer treatment",
    body: "Some cancers, and treatments such as chemotherapy, can lower blood counts, so patients may need red cells or platelets during their treatment.",
  },
  {
    icon: Repeat,
    title: "Conditions needing regular transfusions",
    body: "People living with conditions such as thalassaemia may need transfusions on a regular schedule throughout their lives.",
  },
  {
    icon: Stethoscope,
    title: "Other situations",
    body: "Blood and its components may also be used in the care of some newborns, people with severe anaemia, burns, or bleeding and clotting disorders.",
  },
];

export default function WhyDonatePage() {
  return (
    <div className="page-container py-8 sm:py-12">
      <PageHeader
        eyebrow="Learn"
        title="Why blood donation matters"
        description="Donated blood supports patients in many kinds of care. Here is a calm, plain-language overview of where it is used and why regular voluntary donors matter."
      />

      <section aria-labelledby="components-heading" className="mt-8">
        <h2 id="components-heading" className="mb-1 text-lg font-bold sm:text-xl">
          One donation, different components
        </h2>
        <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
          Blood centres usually separate donated whole blood into components, so that each patient can receive the part they
          need. Some components can also be collected directly by apheresis.{" "}
          <Link href="/donation-types" className="font-medium text-primary underline underline-offset-4">
            Learn about donation types
          </Link>
          .
        </p>
        <ul className="grid gap-4 sm:grid-cols-3">
          {COMPONENTS.map((c) => (
            <li key={c.name} className="surface p-5">
              <div className="mb-2 flex items-center gap-2">
                <Droplet className="size-5 text-primary" aria-hidden="true" />
                <h3 className="text-base font-bold">{c.name}</h3>
              </div>
              <p className="text-sm font-medium text-navy">{c.summary}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.uses}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="needs-heading" className="mt-10">
        <h2 id="needs-heading" className="mb-1 text-lg font-bold sm:text-xl">
          Who may need donated blood
        </h2>
        <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
          Whether a patient receives blood, and which component, is always a decision made by their treating doctors.
        </p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {NEEDS.map(({ icon: Icon, title, body }) => (
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

      <section aria-labelledby="reasons-heading" className="mt-10 grid gap-4 lg:grid-cols-3">
        <h2 id="reasons-heading" className="sr-only">
          Why regular voluntary donors matter
        </h2>
        <div className="surface p-5">
          <div className="mb-2 flex items-center gap-2">
            <HandHeart className="size-5 text-primary" aria-hidden="true" />
            <h3 className="text-base font-bold">Voluntary donation is the safest source</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Health authorities, including the World Health Organization and India&apos;s national blood transfusion guidelines,
            recognise regular voluntary, non-remunerated donors as the safest source of blood. People who donate freely, without
            payment or pressure, have every reason to answer health questions honestly.
          </p>
        </div>
        <div className="surface p-5">
          <div className="mb-2 flex items-center gap-2">
            <FlaskConical className="size-5 text-primary" aria-hidden="true" />
            <h3 className="text-base font-bold">Blood cannot be manufactured</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            There is no artificial substitute for human blood in routine care. Every unit a hospital uses comes from a person who
            chose to donate.
          </p>
        </div>
        <div className="surface p-5">
          <div className="mb-2 flex items-center gap-2">
            <Hourglass className="size-5 text-primary" aria-hidden="true" />
            <h3 className="text-base font-bold">Components do not last long</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Donated components have limited shelf lives. Red cells can be stored for some weeks, but platelets last only a few
            days. That is why steady, regular donation matters more than one-off drives.
          </p>
        </div>
      </section>

      <Notice title="Medical decisions stay with professionals" className="mt-8" icon={HeartPulse}>
        This page is general information, not medical advice. Whether you can donate is decided by the blood centre&apos;s
        doctor, and whether a patient needs a transfusion is decided by their treating doctors. See{" "}
        <Link href="/eligibility" className="font-medium text-primary underline underline-offset-4">
          general eligibility information
        </Link>{" "}
        to learn more.
      </Notice>

      <section aria-labelledby="cta-heading" className="surface-tint mt-12 p-6 sm:p-8">
        <h2 id="cta-heading" className="text-xl font-bold">
          Be part of a steady donor community
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
          Register as a voluntary donor on Rakt Response, or read what to expect before your first donation.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild>
            <Link href="/register">Become a Donor</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/donation-process">The donation process</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/blood-requests">Find Blood</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
