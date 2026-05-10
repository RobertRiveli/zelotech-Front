import {
  getResidentStatusLabel,
  getResidentStatusTone,
} from "@/features/residents/utils/residentFormatters";

export function ResidentStatusBadge({ status }) {
  return (
    <span className={`dashboard-status-badge is-${getResidentStatusTone(status)}`}>
      {getResidentStatusLabel(status)}
    </span>
  );
}
