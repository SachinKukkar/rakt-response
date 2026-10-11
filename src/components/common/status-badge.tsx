import { BadgeCheck, CircleDashed, CircleX, Clock3, HeartHandshake, ShieldAlert, Siren } from "lucide-react";
import { cn } from "@/lib/utils";
import { tx } from "@/i18n/tx";
import {
  PROFILE_VERIFICATION_LABELS,
  RECORD_SOURCE_LABELS,
  REQUEST_STATUS_LABELS,
  STORY_STATUS_LABELS,
  URGENCY_LABELS,
  VERIFICATION_LABELS,
  type ProfileVerification,
  type RecordSource,
  type RequestStatus,
  type StoryStatus,
  type Urgency,
  type VerificationStatus,
} from "@/lib/constants";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "brand";

const TONES: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-warning border-warning/20",
  danger: "bg-destructive/8 text-destructive border-destructive/20",
  info: "bg-secondary text-secondary-foreground border-secondary-foreground/15",
  brand: "bg-accent text-accent-foreground border-primary/15",
};

export function Pill({
  tone = "neutral",
  icon: Icon,
  children,
  className,
}: {
  tone?: Tone;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full border px-2.5 text-xs font-semibold whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
      {tx(children)}
    </span>
  );
}

const REQUEST_TONE: Record<RequestStatus, Tone> = {
  draft: "neutral",
  submitted: "warning",
  under_verification: "warning",
  verified: "success",
  in_coordination: "info",
  fulfilled: "success",
  cancelled: "neutral",
  expired: "neutral",
  rejected: "danger",
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const icon = status === "verified" ? BadgeCheck : status === "in_coordination" ? HeartHandshake : status === "rejected" ? CircleX : Clock3;
  return (
    <Pill tone={REQUEST_TONE[status]} icon={icon}>
      {REQUEST_STATUS_LABELS[status]}
    </Pill>
  );
}

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  if (urgency === "critical") {
    return (
      <Pill tone="danger" icon={Siren}>
        {URGENCY_LABELS.critical}
      </Pill>
    );
  }
  return <Pill tone={urgency === "urgent" ? "brand" : "neutral"}>{URGENCY_LABELS[urgency]}</Pill>;
}

export function VerificationBadge({ status, source }: { status: VerificationStatus; source?: RecordSource }) {
  if (status === "verified") {
    return (
      <Pill tone="success" icon={BadgeCheck}>
        {source ? RECORD_SOURCE_LABELS[source] : VERIFICATION_LABELS.verified}
      </Pill>
    );
  }
  if (status === "rejected") {
    return (
      <Pill tone="danger" icon={CircleX}>
        {VERIFICATION_LABELS.rejected}
      </Pill>
    );
  }
  return (
    <Pill tone="warning" icon={CircleDashed}>
      Self-reported · pending
    </Pill>
  );
}

export function ProfileVerificationBadge({ status }: { status: ProfileVerification }) {
  const tone: Tone = status === "verified" ? "success" : status === "rejected" ? "danger" : status === "pending" ? "warning" : "neutral";
  const icon = status === "verified" ? BadgeCheck : status === "rejected" ? ShieldAlert : CircleDashed;
  return (
    <Pill tone={tone} icon={icon}>
      {PROFILE_VERIFICATION_LABELS[status]}
    </Pill>
  );
}

const STORY_TONE: Record<StoryStatus, Tone> = {
  draft: "neutral",
  submitted: "warning",
  under_review: "warning",
  verification_requested: "info",
  approved: "success",
  rejected: "danger",
  published: "success",
  unpublished: "neutral",
  archived: "neutral",
};

export function StoryStatusBadge({ status }: { status: StoryStatus }) {
  return <Pill tone={STORY_TONE[status]}>{STORY_STATUS_LABELS[status]}</Pill>;
}
