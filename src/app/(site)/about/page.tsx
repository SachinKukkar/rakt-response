import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  CircleCheck,
  CircleX,
  ClipboardList,
  Droplet,
  Lock,
  MessageCircle,
  NotebookPen,
  ShieldCheck,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { Notice, PageHeader } from "@/components/common/page-parts";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "Rakt Response is a volunteer community team that helps voluntary blood donors and people seeking blood connect safely, with privacy and consent built in.",
};

const WHAT_WE_DO: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Users,
    title: "Donor registry",
    body: "Voluntary donors register their blood group, approximate area and availability so that volunteers know who may be able to help.",
  },
  {
    icon: NotebookPen,
    title: "Donation history",
    body: "Donors can keep a simple record of their past donations, which helps them and the team keep track of intervals between donations.",
  },
  {
    icon: ShieldCheck,
    title: "Verified request coordination",
    body: "Authorised volunteers check blood requests with the requester or hospital before treating them as verified, then help reach suitable donors.",
  },
  {
    icon: BookOpen,
    title: "Education",
    body: "Plain-language guides on why donation matters, donation types, general eligibility information and what to expect at a blood centre.",
  },
];

const HOW_WE_WORK: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: UserPlus,
    title: "Donors register",
    body: "You create an account and share your blood group, general location and the kinds of donation you are open to.",
  },
  {
    icon: Lock,
    title: "Profiles stay private by default",
    body: "Your profile and phone number are never listed publicly. You choose what to share and can change it at any time.",
  },
  {
    icon: ClipboardList,
    title: "Volunteers verify requests",
    body: "When someone asks for help, an authorised volunteer checks the details with the requester or hospital before marking it verified.",
  },
  {
    icon: MessageCircle,
    title: "Contact is consent-based",
    body: "A volunteer contacts you about a verified request only if you have agreed to be contacted. You are always free to say no.",
  },
  {
    icon: Droplet,
    title: "Donors record donations",
    body: "After donating at a licensed blood centre, you can add the donation to your history. It stays self-reported until verified.",
  },
];

const WE_DO = [
  "Help voluntary donors and people seeking blood find each other through authorised volunteers",
  "Check requests with the requester or hospital before showing them as verified",
  "Keep donor contact details private and share them only with consent",
  "Share general, responsible information about blood donation",
];

const WE_DO_NOT = [
  "Store, test or process blood",
  "Reserve or hold blood units for anyone",
  "Certify blood group compatibility or medical suitability",
  "Guarantee that a donor will be available or able to donate",
  "Replace hospitals, doctors or licensed blood banks",
];

export default function AboutPage() {
  return (
    <div className="page-container py-8 sm:py-12">
      <PageHeader
        eyebrow="About us"
        title="About Rakt Response"
        description="A volunteer community team helping voluntary blood donors and people seeking blood connect safely and respectfully."
      />

      <section aria-labelledby="mission-heading" className="hero-glow surface flex flex-col items-center gap-6 p-6 text-center sm:flex-row sm:p-8 sm:text-left">
        <LogoMark size="xl" priority />
        <div className="min-w-0 space-y-3">
          <h2 id="mission-heading" className="text-xl font-bold sm:text-2xl">
            Our mission
          </h2>
          <p className="text-[15px] leading-7 text-foreground/90">
            We want every person who needs blood to have a calmer, clearer path to voluntary donors, and every donor to feel
            respected, informed and in control of their own information.
          </p>
          <p className="text-lg font-bold text-primary">{SITE.tagline}</p>
          <p className="text-sm font-semibold text-navy">{SITE.supporting}</p>
        </div>
      </section>

      <section aria-labelledby="who-heading" className="mt-10">
        <div className="prose-rr max-w-3xl">
          <h2 id="who-heading">Who we are</h2>
          <p>
            Rakt Response is run by a community team of volunteers. We are donors, family members of patients and people who
            have seen how stressful it can be to look for blood in a hurry. We came together to make that search more organised,
            more private and more respectful for everyone involved.
          </p>
          <p>
            We are not a hospital or a blood bank. Our role is coordination: helping the right people talk to each other, with
            consent, so that donation can happen at a licensed blood centre.
          </p>
        </div>
      </section>

      <section aria-labelledby="what-heading" className="mt-10">
        <h2 id="what-heading" className="mb-4 text-lg font-bold sm:text-xl">
          What the platform does
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {WHAT_WE_DO.map(({ icon: Icon, title, body }) => (
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

      <section aria-labelledby="how-heading" className="mt-10">
        <h2 id="how-heading" className="mb-1 text-lg font-bold sm:text-xl">
          How we work
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">A short summary of how coordination happens on Rakt Response.</p>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HOW_WE_WORK.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="surface p-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white">
                  {i + 1}
                </span>
                <Icon className="size-5 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="limits-heading" className="mt-10">
        <h2 id="limits-heading" className="mb-1 text-lg font-bold sm:text-xl">
          What we can and cannot guarantee
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          We facilitate coordination. Being clear about our limits helps everyone make safe decisions.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="surface p-5">
            <h3 className="mb-3 text-base font-bold">What we do</h3>
            <ul className="space-y-2.5 text-sm">
              {WE_DO.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="surface p-5">
            <h3 className="mb-3 text-base font-bold">What we do not do</h3>
            <ul className="space-y-2.5 text-sm">
              {WE_DO_NOT.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <CircleX className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Notice title="In an emergency" tone="warning" className="mt-4">
          Contact the treating hospital or the nearest licensed blood bank immediately. Please do not wait for a response on
          Rakt Response.
        </Notice>
      </section>

      <section aria-labelledby="more-heading" className="mt-10">
        <h2 id="more-heading" className="mb-3 text-lg font-bold sm:text-xl">
          Learn more
        </h2>
        <ul className="grid gap-3 text-sm sm:grid-cols-2">
          <li className="surface p-4">
            <Link href="/impact" className="font-semibold text-primary hover:underline">
              Our Impact
            </Link>
            <p className="mt-1 text-muted-foreground">How we report our work, using only figures that have been checked.</p>
          </li>
          <li className="surface p-4">
            <Link href="/privacy" className="font-semibold text-primary hover:underline">
              Privacy policy
            </Link>
            <p className="mt-1 text-muted-foreground">How we protect your information and how consent works.</p>
          </li>
        </ul>
      </section>

      <section aria-labelledby="cta-heading" className="surface-tint mt-12 p-6 sm:p-8">
        <h2 id="cta-heading" className="text-xl font-bold">
          Together we can
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
          Register as a voluntary donor, or look at verified requests for blood in your area.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild>
            <Link href="/register">Become a Donor</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/blood-requests">Find Blood</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/faq">Read the FAQ</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
