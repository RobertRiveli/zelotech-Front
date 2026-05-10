import {
  formatShortDate,
  formatTime,
} from "@/shared/utils/dateFormatter";
import {
  getDosage,
  getMedicationName,
} from "@/features/medications/utils/medicationFormatters";
import { isLateAdministration } from "@/features/medication-administrations/utils/administrationStatus";
import { compareByScheduledAtDesc } from "@/features/medication-administrations/utils/administrationSorters";
import { EmptyState } from "@/shared/ui/EmptyState";
import { AdministrationStatusBadge } from "@/features/medication-administrations/components/AdministrationStatusBadge";

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
              <AdministrationStatusBadge status={status} />
            </article>
          );
        })}
    </div>
  );
}
