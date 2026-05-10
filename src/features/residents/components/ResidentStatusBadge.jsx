import {
  getResidentStatusLabel,
  getResidentStatusTone,
} from "@/features/dashboard/utils/dashboardFormatters";

export function ResidentStatusBadge({ status }) {
  return (
    <span className={`dashboard-status-badge is-${getResidentStatusTone(status)}`}>
      {getResidentStatusLabel(status)}
    </span>
  );
}
