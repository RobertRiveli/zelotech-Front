import {
  administrationStatusLabels,
  administrationStatusTone,
} from "@/features/medication-administrations/constants/administrationStatus";
import { EmptyState } from "@/shared/ui/EmptyState";

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
              <span>{administrationStatusLabels[status]}</span>
              <strong>{count}</strong>
              <small>{percentage}%</small>
            </div>
            <div className="dashboard-status-track" aria-hidden="true">
              <span
                className={`is-${administrationStatusTone[status]}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
