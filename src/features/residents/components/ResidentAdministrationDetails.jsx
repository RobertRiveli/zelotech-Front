import { useState } from "react";
import {
  formatShortDate,
  formatTime,
} from "@/shared/utils/dateFormatter";
import {
  getDosage,
  getMedicationName,
} from "@/features/medications/utils/medicationFormatters";
import { isLateAdministration } from "@/features/medication-administrations/utils/administrationStatus";
import { compareByAdministrationPriority } from "@/features/medication-administrations/utils/administrationSorters";
import { EmptyState } from "@/shared/ui/EmptyState";
import { AdministrationStatusBadge } from "@/features/medication-administrations/components/AdministrationStatusBadge";

export function ResidentAdministrationDetails({ administrations, currentTime }) {
  const [activeFilter, setActiveFilter] = useState("all");

  if (administrations.length === 0) {
    return <EmptyState title="Nenhuma administração registrada." />;
  }

  const administrationRows = administrations.map((administration) => ({
    administration,
    status: getDisplayAdministrationStatus(administration, currentTime),
  }));
  const filters = buildAdministrationFilters(administrationRows);
  const filteredAdministrations = administrationRows
    .filter(({ status }) => matchesAdministrationFilter(status, activeFilter))
    .sort((first, second) =>
      compareByAdministrationPriority(currentTime)(
        first.administration,
        second.administration,
      ),
    );

  return (
    <>
      <div className="resident-list-filters" aria-label="Filtrar administrações">
        {filters.map((filter) => (
          <button
            aria-pressed={activeFilter === filter.id}
            className="resident-list-filter-button"
            key={filter.id}
            type="button"
            onClick={() => setActiveFilter(filter.id)}
          >
            <span>{filter.label}</span>
            <small>{filter.count}</small>
          </button>
        ))}
      </div>

      {filteredAdministrations.length === 0 ? (
        <EmptyState title="Nenhuma administração neste filtro." />
      ) : (
        <div
          aria-label="Lista de administrações do residente"
          className="resident-detail-list"
          tabIndex={0}
        >
          {filteredAdministrations.map(({ administration, status }) => (
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
          ))}
        </div>
      )}
    </>
  );
}

function buildAdministrationFilters(administrationRows) {
  const counts = administrationRows.reduce(
    (accumulator, { status }) => ({
      ...accumulator,
      [status]: (accumulator[status] ?? 0) + 1,
    }),
    {},
  );
  const incidentCount = (counts.REFUSED ?? 0) + (counts.MISSED ?? 0);
  const filters = [
    { id: "all", label: "Todas", count: administrationRows.length },
    { id: "late", label: "Atrasadas", count: counts.LATE ?? 0 },
    { id: "pending", label: "Pendentes", count: counts.PENDING ?? 0 },
    { id: "administered", label: "Administradas", count: counts.ADMINISTERED ?? 0 },
    { id: "incidents", label: "Ocorrências", count: incidentCount },
  ];

  if (counts.CANCELED) {
    filters.push({ id: "canceled", label: "Canceladas", count: counts.CANCELED });
  }

  return filters;
}

function getDisplayAdministrationStatus(administration, currentTime) {
  return isLateAdministration(administration, currentTime)
    ? "LATE"
    : administration.status ?? "PENDING";
}

function matchesAdministrationFilter(status, activeFilter) {
  if (activeFilter === "all") {
    return true;
  }

  if (activeFilter === "incidents") {
    return status === "REFUSED" || status === "MISSED";
  }

  return status.toLowerCase() === activeFilter;
}
