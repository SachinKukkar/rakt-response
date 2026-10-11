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
  Stethoscope,
  Utensils,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { Notice } from "@/components/common/page-parts";
import { CtaBand, MoreDetails, PageHero, SectionTitle, TLDR, TopicPills } from "@/components/learn/learn-parts";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Donation process",
  description:
    "What to expect when you donate blood: how to prepare, what happens at the blood centre, aftercare, and how to update your Rakt Response donation history.",
};

type Step = { icon: LucideIcon; title: string; text: string };

const JOURNEY: { stage: string; emoji: string; steps: Step[] }[] = [
  {
    stage: "Before",
    emoji: "🌙",
    steps: [
      { icon: Bed, title: "Sleep well", text: "A good night's rest helps." },
      { icon: Utensils, title: "Eat a light meal", text: "A few hours before. Never on an empty stomach." },
      { icon: GlassWater, title: "Hydrate", text: "Water or other non-alcoholic drinks." },
      { icon: Wine, title: "Skip alcohol", text: "The centre can tell you how long before." },
      { icon: IdCard, title: "Carry ID", text: "Photo ID, plus any donor card you have." },
    ],
  },
  {
    stage: "At the centre",
    emoji: "🏥",
    steps: [
      { icon: ClipboardList, title: "Register", text: "Staff confirm who you are." },
      { icon: ClipboardCheck, title: "Questionnaire", text: "Confidential. Answer every question honestly." },
      { icon: Stethoscope, title: "Mini health check", text: "Haemoglobin, weight, pulse, BP, temperature. The doctor decides." },
      { icon: Droplet, title: "Donate", text: "Sterile, single-use kit. Whole blood: ~10–15 min." },
      { icon: Coffee, title: "Snack time", text: "Rest, a drink and a snack before you go." },
    ],
  },
  {
    stage: "After",
    emoji: "🛋️",
    steps: [
      { icon: Armchair, title: "Rest 10–15 min", text: "Stay seated at the centre, longer if staff advise." },
      { icon: GlassWater, title: "Drink extra", text: "Keep sipping fluids for the rest of the day." },
      { icon: Dumbbell, title: "Go easy", text: "No heavy exercise or lifting with that arm today." },
      { icon: Bandage, title: "Bandage on", text: "Keep it on a few hours. Bleeding? Press firmly, raise your arm." },
    ],
  },
];

/** Running step numbers across the whole journey. */
const OFFSETS = JOURNEY.map((_, i) => JOURNEY.slice(0, i).reduce((n, st) => n + st.steps.length, 0));

export default function DonationProcessPage() {
  return (
    <>
      <PageHero
        eyebrow="What happens"
        title="Your donation,"
        highlight="step by step."
        subtitle="No surprises. Here's the whole journey, from the night before to the snack after."
        chips={["⏱️ ~1 hr visit (whole blood)", "🩸 One needle"]}
      />

      <div className="page-container space-y-10 pb-4">
        <TLDR
          items={[
            "Sleep, eat, hydrate. Bring ID.",
            "Register, questionnaire, quick health check, then donate.",
            "Whole blood takes ~10–15 min in the chair. SDP takes much longer.",
            "Rest, drink up, go easy for the day. Then log it.",
          ]}
        />

        <section aria-labelledby="journey-heading">
          <SectionTitle kicker="The journey" title="Before → at the centre → after" id="journey-heading" />
          <div className="space-y-6">
            {JOURNEY.map((stage, s) => (
              <div key={stage.stage}>
                <p className="sticker mb-3">
                  <span aria-hidden="true">{stage.emoji}</span> {stage.stage}
                </p>
                <ol className={stage.steps.length > 4 ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-5" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-4"} start={OFFSETS[s] + 1}>
                  {stage.steps.map((step, i) => (
                    <li key={step.title} className="surface flex gap-3 p-4 lg:flex-col">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-navy text-sm font-extrabold text-white">
                        {OFFSETS[s] + i + 1}
                      </span>
                      <div className="min-w-0">
                        <h3 className="flex items-center gap-1.5 leading-tight font-bold">
                          <step.icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                          {step.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <Notice title="SDP and apheresis take longer" tone="brand" icon={Clock} className="mt-4">
            Typically 60–90 minutes or more on the machine, plus screening and rest. Keep a few hours free.{" "}
            <Link href="/donation-types" className="font-medium text-primary underline underline-offset-4">
              Compare types
            </Link>
          </Notice>
        </section>

        <section aria-labelledby="log-heading" className="rounded-3xl bg-navy p-5 text-white sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/10">
              <NotebookPen className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="log-heading" className="text-xl font-extrabold text-white">
                Done? Log it.
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Add the date, type and centre. It stays self-reported until a volunteer verifies it.
              </p>
            </div>
          </div>
          <Button asChild className="press mt-4 w-full sm:w-auto">
            <Link href="/donations/new">Record a donation</Link>
          </Button>
        </section>

        <div className="space-y-3">
          <MoreDetails title="If you feel faint or dizzy">
            <ul>
              <li>Sit or lie down straight away, wherever you are.</li>
              <li>If you can, lie down and raise your legs, or sit with your head between your knees.</li>
              <li>Stay down until the feeling passes, then get up slowly and have a drink.</li>
              <li>If you are still at the centre, tell a staff member immediately.</li>
            </ul>
          </MoreDetails>
          <MoreDetails title="When to contact the blood centre">
            <ul>
              <li>You feel unwell in the hours or days after donating.</li>
              <li>You develop a fever or other symptoms of illness soon after donating.</li>
              <li>
                You remember something you did not mention in the questionnaire, or something relevant changes. This helps keep
                patients safe.
              </li>
            </ul>
            <p>If you feel seriously unwell, seek medical help immediately.</p>
          </MoreDetails>
          <MoreDetails title="More about the visit and your history">
            <p>
              For a whole-blood donation, the whole visit often takes around an hour, including waiting time. An SDP or other
              apheresis centre may also check your platelet count and veins beforehand.
            </p>
            <p>
              Your Rakt Response history helps you keep track of your donations and the time since your last one. A verified
              record does not mean you can donate again on a particular date; the blood centre always decides.
            </p>
          </MoreDetails>
        </div>

        <Notice>
          Every licensed blood centre follows its own procedures within national guidelines. Always follow the staff at your
          centre.
        </Notice>

        <TopicPills current="/donation-process" />
      </div>

      <CtaBand />
    </>
  );
}
