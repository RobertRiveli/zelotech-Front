import {
  formatShortDate,
  formatTime,
  getDosage,
  getMedicationName,
} from "@/features/dashboard/utils/dashboardFormatters";
import { isLateAdministration } from "@/features/dashboard/utils/dashboardSummary";
import { compareByScheduledAtDesc } from "@/features/dashboard/utils/dashboardSorters";
import { EmptyState } from "@/features/dashboard/components/shared/EmptyState";
import { StatusBadge } from "@/features/dashboard/components/shared/StatusBadge";

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
