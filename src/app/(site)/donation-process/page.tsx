import type { Metadata } from "next";
import Link from "next/link";
import {
  Armchair,
  Bandage,
  Bed,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Coffee,
  Droplet,
  Dumbbell,
  GlassWater,
  IdCard,
  NotebookPen,
  Phone,
  Stethoscope,
  Utensils,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { Notice, PageHeader } from "@/components/common/page-parts";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Donation process",
  description:
    "What to expect when you donate blood: how to prepare, what happens at the blood centre, aftercare, and how to update your Rakt Response donation history.",
};

type Item = { icon: LucideIcon; title: string; body: string };

const BEFORE: Item[] = [
  { icon: Bed, title: "Sleep well", body: "Try to get a good night's sleep before your donation." },
  { icon: Utensils, title: "Eat a meal", body: "Have a light, regular meal a few hours before. Avoid donating on an empty stomach." },
  { icon: GlassWater, title: "Drink fluids", body: "Drink plenty of water or other non-alcoholic fluids before you go." },
  { icon: IdCard, title: "Carry ID", body: "Take a valid photo ID, and any donor card or details of previous donations if you have them." },
  { icon: Wine, title: "Avoid alcohol", body: "Avoid alcohol before donating. The blood centre can tell you how long beforehand." },
];

const AT_CENTRE: Item[] = [
  { icon: ClipboardList, title: "Registration", body: "Staff record your details and confirm your identity." },
  {
    icon: ClipboardCheck,
    title: "Questionnaire",
    body: "You answer a confidential health and lifestyle questionnaire. Please answer every question honestly.",
  },
  {
    icon: Stethoscope,
    title: "Mini health check",
    body: "Staff usually check your haemoglobin, weight, pulse, blood pressure and temperature, and the doctor decides whether you can donate today.",
  },
  {
    icon: Droplet,
    title: "Donation",
    body: "You relax in a donor chair while a trained staff member uses sterile, single-use equipment. Whole-blood collection takes roughly 10–15 minutes.",
  },
  {
    icon: Coffee,
    title: "Rest and refreshments",
    body: "You rest for a short while and have a drink and a snack before you leave.",
  },
];

const AFTER: Item[] = [
  { icon: Armchair, title: "Rest for 10–15 minutes", body: "Stay seated at the centre for at least this long, or longer if staff advise." },
  { icon: GlassWater, title: "Drink extra fluids", body: "Keep drinking fluids over the rest of the day." },
  {
    icon: Dumbbell,
    title: "Take it easy",
    body: "Avoid heavy exercise and heavy lifting with the donation arm for the rest of the day.",
  },
  { icon: Bandage, title: "Keep the bandage on", body: "Leave the bandage or plaster on for a few hours. If the site bleeds, press firmly on it and raise your arm." },
];

function StepGrid({ items, numbered = false }: { items: Item[]; numbered?: boolean }) {
  const List = numbered ? "ol" : "ul";
  return (
    <List className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ icon: Icon, title, body }, i) => (
        <li key={title} className="surface p-5">
          <div className="mb-3 flex items-center gap-3">
            {numbered ? (
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white">
                {i + 1}
              </span>
            ) : null}
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
          </div>
          <h3 className="text-base font-bold">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
        </li>
      ))}
    </List>
  );
}

export default function DonationProcessPage() {
  return (
    <div className="page-container py-8 sm:py-12">
      <PageHeader
        eyebrow="Learn"
        title="The donation process"
        description="What to expect before, during and after a blood donation, so you can feel prepared and comfortable."
      />

      <Notice>
        Every licensed blood centre follows its own procedures within national guidelines. Always follow the instructions of
        the staff at your centre.
      </Notice>

      <section aria-labelledby="before-heading" className="mt-10">
        <h2 id="before-heading" className="mb-1 text-lg font-bold sm:text-xl">
          Before you donate
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">A little preparation helps you feel well during and after donation.</p>
        <StepGrid items={BEFORE} />
      </section>

      <section aria-labelledby="centre-heading" className="mt-10">
        <h2 id="centre-heading" className="mb-1 text-lg font-bold sm:text-xl">
          At the blood centre
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          For a whole-blood donation, the whole visit often takes around an hour, including waiting time.
        </p>
        <StepGrid items={AT_CENTRE} numbered />
        <Notice title="SDP and apheresis sessions take longer" tone="brand" icon={Clock} className="mt-4">
          An SDP (single donor platelet) or other apheresis donation uses a machine and typically takes 60–90 minutes or more on
          the machine, plus screening and rest. The centre may also check your platelet count and veins beforehand. Plan to keep
          a few hours free.{" "}
          <Link href="/donation-types" className="font-medium text-primary underline underline-offset-4">
            Learn about donation types
          </Link>
          .
        </Notice>
      </section>

      <section aria-labelledby="after-heading" className="mt-10">
        <h2 id="after-heading" className="mb-1 text-lg font-bold sm:text-xl">
          After you donate
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">Most people feel fine after donating. These steps help.</p>
        <StepGrid items={AFTER} />
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="surface p-5">
            <h3 className="mb-2 text-base font-bold">If you feel faint or dizzy</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/85">
              <li>Sit or lie down straight away, wherever you are.</li>
              <li>If you can, lie down and raise your legs, or sit with your head between your knees.</li>
              <li>Stay down until the feeling passes, then get up slowly and have a drink.</li>
              <li>If you are still at the centre, tell a staff member immediately.</li>
            </ul>
          </div>
          <div className="surface p-5">
            <div className="mb-2 flex items-center gap-2">
              <Phone className="size-5 text-primary" aria-hidden="true" />
              <h3 className="text-base font-bold">Contact the blood centre if</h3>
            </div>
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/85">
              <li>You feel unwell in the hours or days after donating.</li>
              <li>You develop a fever or other symptoms of illness soon after donating.</li>
              <li>
                You remember something you did not mention in the questionnaire, or something relevant changes. This helps keep
                patients safe.
              </li>
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">
              If you feel seriously unwell, seek medical help immediately.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="record-heading" className="mt-10">
        <div className="surface p-5 sm:p-6">
          <div className="mb-2 flex items-center gap-2">
            <NotebookPen className="size-5 text-primary" aria-hidden="true" />
            <h2 id="record-heading" className="text-lg font-bold sm:text-xl">
              Update your Rakt Response donation history
            </h2>
          </div>
          <div className="space-y-3 text-sm leading-relaxed text-foreground/85">
            <p>
              After donating, add the donation to your history on Rakt Response with the date, donation type and blood centre.
              This helps you keep track of your donations and the time since your last one.
            </p>
            <p>
              New entries are marked <strong className="text-navy">self-reported</strong> until a volunteer or administrator
              verifies them. A verified record does not mean you can donate again on a particular date; the blood centre will
              always decide.
            </p>
          </div>
          <div className="mt-4">
            <Button asChild variant="navy">
              <Link href="/donations/new">Record a donation</Link>
            </Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="cta-heading" className="surface-tint mt-12 p-6 sm:p-8">
        <h2 id="cta-heading" className="text-xl font-bold">
          Ready when you are
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
          Register as a voluntary donor, or read general eligibility information before your first visit.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild>
            <Link href="/register">Become a Donor</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/eligibility">Eligibility information</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/blood-requests">Find Blood</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
