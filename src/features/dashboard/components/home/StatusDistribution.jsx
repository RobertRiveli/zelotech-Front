import { statusLabels, statusTone } from "../../constants/dashboardStatus";
import { EmptyState } from "@/features/dashboard/components/shared/EmptyState";

export function StatusDistribution({ total, statusCounts }) {
  const statuses = ["PENDING", "ADMINISTERED", "REFUSED", "MISSED", "CANCELED"];

  if (total === 0) {
    return <EmptyState title="A agenda de hoje ainda não tem itens." />;
  }

  return (
    <div className="dashboard-status-list">
      {statuses.map((status) => {
        const count = statusCounts[status] ?? 0;
        const percentage = Math.round((count / total) * 100);

        return (
          <div className="dashboard-status-row" key={status}>
            <div>
              <span>{statusLabels[status]}</span>
              <strong>{count}</strong>
            </div>
            <div className="dashboard-status-track" aria-hidden="true">
              <span
                className={`is-${statusTone[status]}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
