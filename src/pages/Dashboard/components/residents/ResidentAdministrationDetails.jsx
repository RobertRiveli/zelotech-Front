import {
  formatShortDate,
  formatTime,
  getDosage,
  getMedicationName,
} from "../../utils/dashboardFormatters";
import { isLateAdministration } from "../../utils/dashboardSummary";
import { compareByScheduledAtDesc } from "../../utils/dashboardSorters";
import { EmptyState } from "../shared/EmptyState";
import { StatusBadge } from "../shared/StatusBadge";

export function ResidentAdministrationDetails({ administrations, currentTime }) {
  if (administrations.length === 0) {
    return <EmptyState title="Nenhuma administração registrada." />;
  }

  return (
    <div className="resident-detail-list">
      {[...administrations]
        .sort(compareByScheduledAtDesc)
        .slice(0, 5)
        .map((administration) => {
          const status = isLateAdministration(administration, currentTime)
            ? "LATE"
            : administration.status ?? "PENDING";

          return (
            <article className="resident-administration-item" key={administration.id}>
              <time dateTime={administration.scheduledAt}>
                {formatShortDate(administration.scheduledAt)} ·{" "}
                {formatTime(administration.scheduledAt)}
              </time>
              <div>
                <strong>{getMedicationName(administration.medication)}</strong>
                <span>{getDosage(administration)}</span>
              </div>
              <StatusBadge status={status} />
            </article>
          );
        })}
    </div>
  );
}
