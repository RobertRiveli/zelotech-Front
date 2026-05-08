import {
  getResidentStatusLabel,
  getResidentStatusTone,
} from "../../utils/dashboardFormatters";

export function ResidentStatusBadge({ status }) {
  return (
    <span className={`dashboard-status-badge is-${getResidentStatusTone(status)}`}>
      {getResidentStatusLabel(status)}
    </span>
  );
}
