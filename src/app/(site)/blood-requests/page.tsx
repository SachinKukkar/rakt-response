import type { Metadata } from "next";
import Link from "next/link";
import { HandHeart, Hospital, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, Notice, PageHeader } from "@/components/common/page-parts";
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
    <div className="page-container py-8 sm:py-12">
      <PageHeader
        eyebrow="Find blood"
        title="Blood requests"
        description="Need donors? Submit a request and a volunteer will verify it, then reach out to consenting donors who match."
        actions={
          <Button asChild size="lg">
            <Link href="/blood-requests/new">
              <Plus className="size-4" aria-hidden="true" /> Submit a request
            </Link>
          </Button>
        }
      />

      <Notice tone="warning" icon={Hospital} title="In an emergency, contact the hospital first" className="mb-6">
        The treating hospital or nearest licensed blood bank should always be your first call. Rakt Response coordinates voluntary
        donors; it cannot reserve blood, certify compatibility or guarantee that a donor will be available.
      </Notice>

      <section aria-labelledby="verified-heading">
        <h2 id="verified-heading" className="mb-1 text-lg font-bold">
          Verified requests
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Only requests checked by a volunteer and listed with the requester&apos;s permission appear here. If you can help, sign in
          and respond — a volunteer will coordinate with you. Please don&apos;t go to the hospital until a volunteer confirms.
        </p>

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
  );
}
