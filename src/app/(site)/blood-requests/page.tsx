import type { Metadata } from "next";
import Link from "next/link";
import { HandHeart, Hospital, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, Notice } from "@/components/common/page-parts";
import { PageHero, SectionTitle } from "@/components/learn/learn-parts";
import { Pagination, parsePage } from "@/components/common/pagination";
import { RequestCard } from "@/components/requests/request-card";
import { selectClass } from "@/components/common/form-parts";
import { Input } from "@/components/ui/input";
import { listPublicRequests } from "@/lib/data/public";
import { BLOOD_GROUPS, REQUEST_TYPE_LABELS, REQUEST_TYPES, type BloodGroup, type RequestType } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Find blood",
  description: "Submit a blood request for volunteer coordination and see verified requests where voluntary donors can help.",
};

const PAGE_SIZE = 12;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BloodRequestsPage({ searchParams }: PageProps<"/blood-requests">) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const groupParam = one(params.group);
  const typeParam = one(params.type);
  const group = BLOOD_GROUPS.includes(groupParam as BloodGroup) ? (groupParam as BloodGroup) : null;
  const type = REQUEST_TYPES.includes(typeParam as RequestType) ? (typeParam as RequestType) : null;
  const district = (one(params.district) ?? "").trim().slice(0, 60) || null;

  const result = await listPublicRequests({ bloodGroup: group, district, requestType: type, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });

  return (
    <>
      <PageHero
        eyebrow="Find blood"
        title="Need blood?"
        highlight="We'll rally donors."
        subtitle="Tell us what's needed. A volunteer verifies it, then reaches out to matching donors who said yes to being contacted."
        chips={["Verified before sharing", "Free, always", "Your details stay private"]}
      >
        <Button asChild size="lg" className="press bg-white text-primary hover:bg-white/90">
          <Link href="/blood-requests/new">
            <Plus className="size-4" aria-hidden="true" /> Submit a request
          </Link>
        </Button>
      </PageHero>
    <div className="page-container space-y-6 py-8">
      <Notice tone="warning" icon={Hospital} title="Emergency? Call the hospital first">
        The treating hospital or nearest licensed blood bank comes first. We coordinate voluntary donors — we can&apos;t reserve blood,
        check compatibility or guarantee a donor.
      </Notice>

      <section aria-labelledby="verified-heading">
        <SectionTitle id="verified-heading" kicker="Can you help?" title="Verified requests" />
        <p className="-mt-2 mb-4 text-sm text-muted-foreground">Checked by a volunteer and shared with permission. Tap one to respond.</p>

        <form method="get" className="surface mb-4 grid gap-3 p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end" role="search" aria-label="Filter requests">
          <div className="space-y-1.5">
            <label htmlFor="f-group" className="text-xs font-semibold text-navy">
              Blood group
            </label>
            <select id="f-group" name="group" defaultValue={group ?? ""} className={selectClass}>
              <option value="">All groups</option>
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="f-type" className="text-xs font-semibold text-navy">
              Donor type
            </label>
            <select id="f-type" name="type" defaultValue={type ?? ""} className={selectClass}>
              <option value="">All types</option>
              {REQUEST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {REQUEST_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="f-district" className="text-xs font-semibold text-navy">
              District
            </label>
            <Input id="f-district" name="district" defaultValue={district ?? ""} placeholder="e.g. Pune" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1 sm:flex-none">
              Apply
            </Button>
            {group || type || district ? (
              <Button asChild variant="ghost">
                <Link href="/blood-requests">Reset</Link>
              </Button>
            ) : null}
          </div>
        </form>

        {result === null ? (
          <Notice title="Requests are unavailable right now">We couldn&apos;t load verified requests. Please try again shortly.</Notice>
        ) : result.requests.length === 0 ? (
          <EmptyState
            icon={HandHeart}
            title={group || type || district ? "No verified requests match these filters" : "No open verified requests right now"}
            description="That's good news. Register as a donor so we can reach you when a request matches your blood group."
            action={
              <Button asChild variant="outline">
                <Link href="/register">Become a Donor</Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              {result.requests.map((request) => (
                <RequestCard key={request.id} request={request} href={`/blood-requests/${request.id}`} />
              ))}
            </div>
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={result.total}
              basePath="/blood-requests"
              params={{ group: group ?? undefined, type: type ?? undefined, district: district ?? undefined }}
            />
          </>
        )}
      </section>
    </div>
    </>
  );
}
