import { formatTime, toDate } from "@/shared/utils/dateFormatter";
import {
  getDosage,
  getMedicationName,
} from "@/features/medications/utils/medicationFormatters";
import { EmptyState } from "@/shared/ui/EmptyState";
import { AdministrationStatusBadge } from "@/features/medication-administrations/components/AdministrationStatusBadge";

const NOW_WINDOW_IN_MS = 60 * 60 * 1000;

export function MedicationSchedule({
  administrations,
  currentTime,
  onOpenAdministration,
}) {
  if (administrations.length === 0) {
    return <EmptyState title="Nenhuma administração encontrada para hoje." />;
  }

  const scheduleGroups = buildScheduleGroups(administrations, currentTime);

  return (
    <div
      className="dashboard-schedule-scroll"
      role="region"
      aria-label="Agenda de medicações de hoje"
      tabIndex={0}
    >
      <div className="dashboard-schedule-groups">
        {scheduleGroups.map((group) => (
          <section
            className={`dashboard-schedule-group is-${group.id}`}
            key={group.id}
          >
            <header className="dashboard-schedule-group-header">
              <strong>{group.title}</strong>
              <small>{group.items.length}</small>
            </header>

            <div className="dashboard-schedule-list">
              {group.items.map((administration) => {
                const status = administration.status ?? "PENDING";
                const medicationName = getMedicationName(
                  administration.medication,
                );
                const scheduledAt = toDate(administration.scheduledAt);
                const isLate =
                  status === "PENDING" &&
                  scheduledAt &&
                  currentTime > 0 &&
                  scheduledAt.getTime() < currentTime;
                const actionLabel =
                  status === "PENDING" ? "Registrar" : "Detalhes";

                return (
                  <article
                    className="dashboard-schedule-item"
                    key={administration.id}
                  >
                    <time dateTime={administration.scheduledAt}>
                      {formatTime(scheduledAt)}
                    </time>
                    <div>
                      <strong>
                        {administration.resident?.fullName ?? "Residente"}
                      </strong>
                      <span>
                        {medicationName} · {getDosage(administration)}
                      </span>
                    </div>
                    <AdministrationStatusBadge
                      status={isLate ? "LATE" : status}
                    />
                    <button
                      className="dashboard-schedule-action"
                      type="button"
                      onClick={() => onOpenAdministration?.(administration)}
                    >
                      {actionLabel}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function buildScheduleGroups(administrations, currentTime) {
  const groups = {
    late: {
      id: "late",
      title: "Atrasadas",
      items: [],
    },
    now: {
      id: "now",
      title: "Agora",
      items: [],
    },
    next: {
      id: "next",
      title: "Próximas",
      items: [],
    },
    done: {
      id: "done",
      title: "Concluídas",
      items: [],
    },
  };

  administrations.forEach((administration) => {
    const status = administration.status ?? "PENDING";
    const scheduledAt = toDate(administration.scheduledAt);
    const scheduledTime = scheduledAt?.getTime();
    const hasScheduledTime = scheduledTime != null;
    const isPending = status === "PENDING";
    const isLate =
      isPending &&
      hasScheduledTime &&
      currentTime > 0 &&
      scheduledTime < currentTime;
    const isNow =
      isPending &&
      hasScheduledTime &&
      currentTime > 0 &&
      scheduledTime <= currentTime + NOW_WINDOW_IN_MS;

    if (!isPending) {
      groups.done.items.push(administration);
      return;
    }

    if (isLate) {
      groups.late.items.push(administration);
      return;
    }

    if (isNow) {
      groups.now.items.push(administration);
      return;
    }

    groups.next.items.push(administration);
  });

  return [groups.late, groups.now, groups.next, groups.done].filter(
    (group) => group.items.length > 0,
  );
}
