import {
  formatTime,
  toDate,
} from "@/shared/utils/dateFormatter";
import {
  getDosage,
  getMedicationName,
} from "@/features/medications/utils/medicationFormatters";
import { EmptyState } from "@/shared/ui/EmptyState";
import { AdministrationStatusBadge } from "@/features/medication-administrations/components/AdministrationStatusBadge";

export function MedicationSchedule({ administrations, currentTime }) {
  if (administrations.length === 0) {
    return (
      <EmptyState title="Nenhuma administração encontrada para hoje." />
    );
  }

  return (
    <div className="dashboard-schedule-list">
      {administrations.slice(0, 8).map((administration) => {
        const status = administration.status ?? "PENDING";
        const medicationName = getMedicationName(administration.medication);
        const scheduledAt = toDate(administration.scheduledAt);
        const isLate =
          status === "PENDING" &&
          scheduledAt &&
          currentTime > 0 &&
          scheduledAt.getTime() < currentTime;

        return (
          <article className="dashboard-schedule-item" key={administration.id}>
            <time dateTime={administration.scheduledAt}>
              {formatTime(scheduledAt)}
            </time>
            <div>
              <strong>{administration.resident?.fullName ?? "Residente"}</strong>
              <span>
                {medicationName} · {getDosage(administration)}
              </span>
            </div>
            <AdministrationStatusBadge status={isLate ? "LATE" : status} />
          </article>
        );
      })}
    </div>
  );
}
