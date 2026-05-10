import { matchesSearch } from "@/shared/utils/search";
import { normalizeText } from "@/shared/utils/textFormatter";
import { countByStatus, isLateAdministration } from "./administrationStatus";
import { getDosage, getMedicationName } from "@/features/medications/utils/medicationFormatters";

export const administrationFilters = [
  { id: "all", label: "Todas" },
  { id: "pending", label: "Pendentes" },
  { id: "late", label: "Atrasadas" },
  { id: "administered", label: "Administradas" },
  { id: "incidents", label: "Recusadas/perdidas" },
  { id: "canceled", label: "Canceladas" },
];

export function buildAdministrationStats(administrations, currentTime) {
  const statusCounts = countByStatus(administrations);
  const lateAdministrations = administrations.filter((administration) =>
    isLateAdministration(administration, currentTime),
  );

  return {
    administered: statusCounts.ADMINISTERED ?? 0,
    late: lateAdministrations.length,
    pending: statusCounts.PENDING ?? 0,
    total: administrations.length,
  };
}

export function buildAdministrationFilterCounts(administrations, currentTime) {
  const statusCounts = countByStatus(administrations);

  return {
    administered: statusCounts.ADMINISTERED ?? 0,
    all: administrations.length,
    canceled: statusCounts.CANCELED ?? 0,
    incidents: (statusCounts.REFUSED ?? 0) + (statusCounts.MISSED ?? 0),
    late: administrations.filter((administration) =>
      isLateAdministration(administration, currentTime),
    ).length,
    pending: statusCounts.PENDING ?? 0,
  };
}

export function filterAdministrations(
  administrations,
  { currentTime, filterId, searchTerm },
) {
  const normalizedSearch = normalizeText(searchTerm);

  return administrations.filter((administration) => {
    if (!matchesAdministrationFilter(administration, filterId, currentTime)) {
      return false;
    }

    return matchesSearch(
      [
        administration.resident?.fullName,
        getMedicationName(administration.medication),
        getDosage(administration),
        administration.prescription?.route,
        administration.prescription?.frequency,
        administration.caregiver?.fullName,
        administration.reason,
        administration.notes,
      ],
      normalizedSearch,
    );
  });
}

export function getAdministrationDisplayStatus(administration, currentTime) {
  return isLateAdministration(administration, currentTime)
    ? "LATE"
    : administration.status ?? "PENDING";
}

export function getAdministrationFilterLabel(filterId) {
  return (
    administrationFilters.find((filter) => filter.id === filterId)?.label ??
    "Todas"
  );
}

export function isPendingAdministration(administration) {
  return (administration.status ?? "PENDING") === "PENDING";
}

function matchesAdministrationFilter(administration, filterId, currentTime) {
  const status = administration.status ?? "PENDING";

  if (filterId === "pending") {
    return status === "PENDING";
  }

  if (filterId === "late") {
    return isLateAdministration(administration, currentTime);
  }

  if (filterId === "administered") {
    return status === "ADMINISTERED";
  }

  if (filterId === "incidents") {
    return status === "REFUSED" || status === "MISSED";
  }

  if (filterId === "canceled") {
    return status === "CANCELED";
  }

  return true;
}
