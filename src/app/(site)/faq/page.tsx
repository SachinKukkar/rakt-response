import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Notice, PageHeader } from "@/components/common/page-parts";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about blood donation, privacy, verified requests and how Rakt Response works.",
};

const linkClass = "font-medium text-primary underline underline-offset-4";

type Faq = { q: string; a: React.ReactNode };

const GROUPS: { id: string; title: string; items: Faq[] }[] = [
  {
    id: "donating",
    title: "About donating",
    items: [
      {
        q: "Is donating blood safe?",
        a: (
          <p>
            At licensed blood centres, donation is carried out by trained staff using sterile, single-use equipment that is
            discarded after each donor, so the equipment cannot pass an infection to you. Most people feel fine afterwards; some
            feel briefly light-headed, which is why you rest before leaving. See{" "}
            <Link href="/donation-process" className={linkClass}>
              what to expect
            </Link>
            .
          </p>
        ),
      },
      {
        q: "How often can I donate?",
        a: (
          <p>
            It depends on the type of donation. Whole-blood donations need the longest gap, and in India the interval typically
            differs for men and women. Apheresis donations such as SDP have their own, shorter intervals. The blood centre
            decides each time. Read{" "}
            <Link href="/eligibility" className={linkClass}>
              general eligibility information
            </Link>
            .
          </p>
        ),
      },
      {
        q: "What is the difference between whole blood and SDP?",
        a: (
          <p>
            A whole-blood donation collects blood into a bag, which is later separated into components. An SDP (single donor
            platelet) donation uses a machine to collect only platelets and return the rest of your blood; it takes longer and
            needs extra checks. They are not interchangeable.{" "}
            <Link href="/donation-types" className={linkClass}>
              Compare donation types
            </Link>
            .
          </p>
        ),
      },
      {
        q: "Does registering mean I am eligible to donate?",
        a: (
          <p>
            No. Registering on Rakt Response only means you are willing to be contacted about donating. Rakt Response does not
            decide eligibility. The blood centre&apos;s doctor screens you at every donation, and their decision is final.
          </p>
        ),
      },
      {
        q: "Does Rakt Response pay donors?",
        a: (
          <p>
            No. Rakt Response supports voluntary, non-remunerated donation only. No one should ask you for, or offer you, money
            to donate through the platform. If this happens, please tell us.
          </p>
        ),
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy and your profile",
    items: [
      {
        q: "Who can see my phone number?",
        a: (
          <p>
            Nobody publicly. Your phone number is never listed on the site. Only an authorised volunteer coordinating a verified
            request can see it, and only if you have consented to be contacted. Every such access is logged.
          </p>
        ),
      },
      {
        q: "Can I hide my profile or withdraw my consent?",
        a: (
          <p>
            Yes, at any time. In Privacy &amp; settings you can turn directory visibility, contact permission and alerts on or
            off. Changes take effect straight away. Read our{" "}
            <Link href="/privacy" className={linkClass}>
              privacy policy
            </Link>
            .
          </p>
        ),
      },
      {
        q: "Will I get SMS or WhatsApp spam?",
        a: (
          <p>
            No. Rakt Response does not send bulk messages. Updates appear as in-app notifications, and a volunteer contacts you
            directly only about a verified request and only if you have given consent.
          </p>
        ),
      },
      {
        q: "How do I delete my account?",
        a: (
          <p>
            You can request deletion from Settings. We remove you from donor discovery at once, and an administrator completes
            the request. Your contact details, location and profile are anonymised; aggregated, non-identifying counts may
            remain.
          </p>
        ),
      },
    ],
  },
  {
    id: "requests",
    title: "Blood requests and emergencies",
    items: [
      {
        q: "What should I do in an emergency?",
        a: (
          <p>
            Contact the treating hospital or the nearest licensed blood bank immediately. Please do not wait for a response on
            Rakt Response. The platform can help find voluntary donors, but it is not an emergency service.
          </p>
        ),
      },
      {
        q: "How are blood requests verified?",
        a: (
          <p>
            An authorised volunteer checks the details with the requester or the hospital before marking a request as
            verified. Requests that have not been verified are never shown as confirmed.
          </p>
        ),
      },
      {
        q: "Does Rakt Response guarantee blood?",
        a: (
          <p>
            No. Rakt Response helps coordinate between voluntary donors and people seeking blood. We do not store blood, reserve
            units, certify compatibility or guarantee that a donor will be available. Hospitals and licensed blood banks remain
            responsible for supplying blood.
          </p>
        ),
      },
    ],
  },
  {
    id: "records",
    title: "Donation records and stories",
    items: [
      {
        q: "What do “self-reported” and “verified” donations mean?",
        a: (
          <p>
            A <strong>self-reported</strong> donation is one you added to your history yourself. It becomes{" "}
            <strong>verified</strong> once a volunteer or administrator has checked it against supporting details. Neither label
            is a medical decision about when you can donate next.
          </p>
        ),
      },
      {
        q: "How are stories published?",
        a: (
          <p>
            Stories are published only after review by our team and with your consent. You can choose what details to share, and
            you can withdraw your story later.
          </p>
        ),
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="page-container py-8 sm:py-12">
      <PageHeader
        eyebrow="Help"
        title="Frequently asked questions"
        description="Short answers about donating, privacy and how Rakt Response coordinates verified requests."
      />

      <nav aria-label="FAQ sections" className="mb-8">
        <ul className="flex flex-wrap gap-2">
          {GROUPS.map((g) => (
            <li key={g.id}>
              <a
                href={`#${g.id}`}
                className="inline-flex min-h-10 items-center rounded-full border border-border bg-card px-4 text-sm font-medium text-navy hover:bg-muted"
              >
                {g.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="max-w-3xl space-y-10">
        {GROUPS.map((g) => (
          <section key={g.id} id={g.id} aria-labelledby={`${g.id}-heading`} className="scroll-mt-24">
            <h2 id={`${g.id}-heading`} className="mb-3 text-lg font-bold sm:text-xl">
              {g.title}
            </h2>
            <div className="space-y-3">
              {g.items.map((item) => (
                <details key={item.q} className="group surface overflow-hidden">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-semibold text-navy hover:bg-muted/50 [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <ChevronDown
                      className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="px-5 pb-5 text-[15px] leading-7 text-foreground/85">{item.a}</div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Notice title="Still have a question?" className="mt-10 max-w-3xl">
        For medical questions about your own health, please speak to a blood centre or your doctor. For questions about Rakt
        Response, you can{" "}
        <Link href="/contact" className={linkClass}>
          contact us
        </Link>
        .
      </Notice>

      <section aria-labelledby="cta-heading" className="surface-tint mt-12 p-6 sm:p-8">
        <h2 id="cta-heading" className="text-xl font-bold">
          Join the donor community
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
          Register as a voluntary donor, or look at verified blood requests.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild>
            <Link href="/register">Become a Donor</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/blood-requests">Find Blood</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/why-donate">Why donate</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
