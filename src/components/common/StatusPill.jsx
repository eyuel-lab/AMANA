import { LISTING_STATUS_LABEL, RECORD_STATUS_LABEL, REPORT_STATUS_LABEL, ORDER_STATUS_LABEL, label } from "@/lib/constants";
import { cn } from "@/lib/utils";

const LABELS = {
  ...LISTING_STATUS_LABEL,
  ...RECORD_STATUS_LABEL,
  ...REPORT_STATUS_LABEL,
  ...ORDER_STATUS_LABEL,
  verified: "Verified",
  unverified: "Unverified",
  open: "Open",
  in_review: "In review",
  in_progress: "In progress",
  awaiting_info: "Awaiting info",
  closed: "Closed",
  approved: "Approved",
  pending: "Pending review",
  suspended: "Suspended",
  cancelled: "Cancelled",
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
  active: "Active",
  none: "No record",
  success: "Success",
  denied: "Denied",
  failed: "Failed",
};

const TONES = {
  success: "border-success/20 bg-success-soft text-success",
  warning: "border-warning/25 bg-warning-soft text-warning",
  danger: "border-danger/20 bg-danger-soft text-danger",
  neutral: "border-border bg-secondary text-muted-foreground",
  gold: "border-gold/30 bg-gold/10 text-gold-deep",
};

const BY_STATUS = {
  registered: "success", active: "success", verified: "success", completed: "success",
  resolved: "success", approved: "success", paid: "success", confirmed: "success", success: "success",
  pending: "warning", pending_review: "warning", pending_acceptance: "warning", under_review: "warning",
  submitted: "warning", more_info: "warning", processing: "warning", ready: "warning", reserved: "warning",
  refund_pending: "warning", medium: "warning", in_review: "warning", awaiting_info: "warning", in_progress: "warning",
  restricted: "danger", reported_stolen: "danger", reported_lost: "danger", rejected: "danger",
  disputed: "danger", cancelled: "danger", suspended: "danger", archived: "danger", high: "danger",
  failed: "danger", denied: "danger", unverified: "neutral",
  transfer_pending: "gold", low: "neutral", draft: "neutral", paused: "neutral", closed: "neutral",
  refunded: "neutral", none: "neutral",
};

export default function StatusPill({ status, text, className }) {
  const tone = TONES[BY_STATUS[status] || "neutral"];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium capitalize", tone, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {text || label(LABELS, status)}
    </span>
  );
}