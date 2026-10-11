import Link from "next/link";
import { CalendarClock, Hospital, MapPin } from "lucide-react";
import { BloodGroupChip } from "@/components/common/blood-group-chip";
import { RequestStatusBadge, UrgencyBadge } from "@/components/common/status-badge";
import { REQUEST_TYPE_LABELS, type BloodGroup, type RequestStatus, type RequestType, type Urgency } from "@/lib/constants";
import { formatDateTime, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getT } from "@/i18n/server";

export interface RequestCardData {
  id: string;
  reference_code: string;
  blood_group: BloodGroup;
  request_type: RequestType;
  units_needed: number | null;
  hospital_name: string;
  city: string;
  district: string;
  required_by: string;
  urgency: Urgency;
  status: RequestStatus;
}

export async function RequestCard({
  request,
  href,
  footer,
  className,
}: {
  request: RequestCardData;
  href?: string;
  footer?: React.ReactNode;
  className?: string;
}) {
  const t = await getT();
  const body = (
    <>
      <div className="flex items-start gap-3">
        <BloodGroupChip group={request.blood_group} size="md" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <UrgencyBadge urgency={request.urgency} />
            <RequestStatusBadge status={request.status} />
          </div>
          <p className="font-bold text-navy">
            {t(REQUEST_TYPE_LABELS[request.request_type])}
            {request.units_needed
              ? ` · ${t(request.units_needed > 1 ? "{count} units" : "{count} unit", { count: request.units_needed })}`
              : ""}
          </p>
          <p className="flex items-start gap-1.5 text-sm text-foreground/85">
            <Hospital className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="min-w-0 break-words">{request.hospital_name}</span>
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {request.city}, {request.district}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
            <span>
              {t("Needed by {date}", { date: formatDateTime(request.required_by) })}{" "}
              <span className="text-xs">({relativeTime(request.required_by)})</span>
            </span>
          </p>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{t("Ref. {code}", { code: request.reference_code })}</p>
    </>
  );
  return (
    <article className={cn("surface p-4", request.urgency === "critical" && "border-primary/30", className)}>
      {href ? (
        <Link href={href} className="block rounded-xl focus-visible:outline-offset-4" aria-label={t("Request {code}: {group} at {hospital}", {
            code: request.reference_code,
            group: request.blood_group,
            hospital: request.hospital_name,
          })}>
          {body}
        </Link>
      ) : (
        body
      )}
      {footer ? <div className="mt-3 border-t pt-3">{footer}</div> : null}
    </article>
  );
}
