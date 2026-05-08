import { countByStatus, isLateAdministration } from "./dashboardSummary";
import { toDate } from "./dashboardFormatters";

export function buildResidentsStats({
  administrations,
  allResidents,
  currentTime,
}) {
  const statusCounts = countByStatus(administrations);

  return {
    lateAdministrations: administrations.filter((administration) =>
      isLateAdministration(administration, currentTime),
    ).length,
    pendingAdministrations: statusCounts.PENDING ?? 0,
    recentAdmissions: allResidents.filter((resident) =>
      isRecentAdmission(resident.admissionDate, currentTime),
    ).length,
    totalResidents: allResidents.length,
    withBloodType: allResidents.filter((resident) => resident.bloodType).length,
  };
}

export function buildResidentAdministrationSummary(
  residentId,
  administrations,
  currentTime,
) {
  const residentAdministrations = administrations.filter(
    (administration) => getRecordResidentId(administration) === residentId,
  );

  return {
    late: residentAdministrations.filter((administration) =>
      isLateAdministration(administration, currentTime),
    ).length,
    pending: residentAdministrations.filter(
      (administration) => (administration.status ?? "PENDING") === "PENDING",
    ).length,
    total: residentAdministrations.length,
  };
}

export function countRecordsByResidentId(records, residentId) {
  return records.filter((record) => getRecordResidentId(record) === residentId)
    .length;
}

export function getRecordResidentId(record) {
  return record.residentId ?? record.resident?.id ?? "";
}

export function isRecentAdmission(admissionDate, currentTime) {
  const date = toDate(admissionDate);
  const now = toDate(currentTime);

  if (!date || !now || date > now) {
    return false;
  }

  const millisecondsInDay = 24 * 60 * 60 * 1000;
  return now.getTime() - date.getTime() <= 30 * millisecondsInDay;
}
