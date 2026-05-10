import { statusLabels, statusTone } from "../../constants/dashboardStatus";

export function StatusBadge({ status }) {
  if (status === "LATE") {
    return <span className="dashboard-status-badge is-danger">Atrasada</span>;
  }

  return (
    <span className={`dashboard-status-badge is-${statusTone[status] ?? "muted"}`}>
      {statusLabels[status] ?? status}
    </span>
  );
}
