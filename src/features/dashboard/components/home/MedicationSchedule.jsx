import {
  formatTime,
  getDosage,
  getMedicationName,
  toDate,
} from "@/features/dashboard/utils/dashboardFormatters";
import { EmptyState } from "@/features/dashboard/components/shared/EmptyState";
import { StatusBadge } from "@/features/dashboard/components/shared/StatusBadge";

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
            <StatusBadge status={isLate ? "LATE" : status} />
          </article>
        );
      })}
    </div>
  );
}
