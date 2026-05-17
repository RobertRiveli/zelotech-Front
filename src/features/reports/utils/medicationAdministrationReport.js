import {
  administrationStatusLabels,
  administrationStatusTone,
} from "@/features/medication-administrations/constants/administrationStatus";
import {
  countByStatus,
  isLateAdministration,
} from "@/features/medication-administrations/utils/administrationStatus";
import { getRecordResidentId } from "@/features/residents/utils/residentDashboardUtils";
import {
  getDosage,
  getMedicationName,
} from "@/features/medications/utils/medicationFormatters";
import { matchesSearch } from "@/shared/utils/search";
import { normalizeText } from "@/shared/utils/textFormatter";
import { formatDateTime, toDate } from "@/shared/utils/dateFormatter";
import {
  medicationAdministrationReportDistributionItems,
  medicationAdministrationReportPeriods,
} from "@/features/reports/constants/medicationAdministrationReport";

export function buildMedicationAdministrationPeriodRange({
  customEndDate,
  customStartDate,
  currentDateKey,
  periodId,
}) {
  const today = startOfDay(parseDateInput(currentDateKey));

  if (periodId === "last7") {
    return {
      startDate: addDays(today, -6),
      endDate: endOfDay(today),
    };
  }

  if (periodId === "month") {
    return {
      startDate: new Date(today.getFullYear(), today.getMonth(), 1),
      endDate: endOfDay(today),
    };
  }

  if (periodId === "custom") {
    const rawStartDate = parseDateInput(customStartDate) ?? today;
    const rawEndDate = parseDateInput(customEndDate) ?? rawStartDate;
    const startDate = startOfDay(rawStartDate);
    const endDate = endOfDay(rawEndDate);

    return endDate < startDate
      ? { startDate: startOfDay(rawEndDate), endDate: endOfDay(rawStartDate) }
      : { startDate, endDate };
  }

  return {
    startDate: today,
    endDate: endOfDay(today),
  };
}

export function filterMedicationAdministrationReport(
  administrations,
  filters,
) {
  const {
    currentTime,
    medicationFilter,
    periodRange,
    residentFilter,
    searchTerm,
    statusFilter,
  } = filters;
  const normalizedSearch = normalizeText(searchTerm);

  return administrations.filter((administration) => {
    const scheduledAt = toDate(administration.scheduledAt);

    if (
      !scheduledAt ||
      scheduledAt < periodRange.startDate ||
      scheduledAt > periodRange.endDate
    ) {
      return false;
    }

    if (
      residentFilter !== "all" &&
      getRecordResidentId(administration) !== residentFilter
    ) {
      return false;
    }

    if (
      medicationFilter !== "all" &&
      getRecordMedicationId(administration) !== medicationFilter
    ) {
      return false;
    }

    if (!matchesMedicationAdministrationStatusFilter(administration, statusFilter, currentTime)) {
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

export function buildMedicationAdministrationReportStats(
  administrations,
  currentTime,
) {
  const statusCounts = countByStatus(administrations);
  const total = administrations.length;
  const administered = statusCounts.ADMINISTERED ?? 0;
  const incidents = (statusCounts.REFUSED ?? 0) + (statusCounts.MISSED ?? 0);
  const late = administrations.filter((administration) =>
    isLateAdministration(administration, currentTime),
  ).length;

  return {
    administered,
    adherenceRate: total > 0 ? Math.round((administered / total) * 100) : 0,
    incidents,
    late,
    total,
  };
}

export function buildMedicationAdministrationStatusDistribution(
  administrations,
  currentTime,
) {
  const statusCounts = countByStatus(administrations);
  const total = Math.max(administrations.length, 1);
  const late = administrations.filter((administration) =>
    isLateAdministration(administration, currentTime),
  ).length;

  return medicationAdministrationReportDistributionItems.map((item) => {
    const count = item.id === "LATE" ? late : statusCounts[item.id] ?? 0;
    const tone =
      item.id === "LATE"
        ? "danger"
        : administrationStatusTone[item.id] ?? "muted";

    return {
      ...item,
      count,
      percent: Math.round((count / total) * 100),
      tone,
    };
  });
}

export function buildMedicationAdministrationAttentionMedications(
  administrations,
  currentTime,
) {
  const medicationsByKey = new Map();

  administrations.forEach((administration) => {
    const key =
      getRecordMedicationId(administration) ||
      getMedicationName(administration.medication);
    const status = administration.status ?? "PENDING";
    const current = medicationsByKey.get(key) ?? {
      key,
      name: getMedicationName(administration.medication),
      score: 0,
      total: 0,
    };
    const hasOccurrence =
      isLateAdministration(administration, currentTime) ||
      status === "REFUSED" ||
      status === "MISSED";

    medicationsByKey.set(key, {
      ...current,
      score: current.score + (hasOccurrence ? 1 : 0),
      total: current.total + 1,
    });
  });

  return Array.from(medicationsByKey.values())
    .filter((item) => item.score > 0)
    .sort((first, second) => second.score - first.score || second.total - first.total)
    .slice(0, 5);
}

export function buildMedicationAdministrationResidentOptions(
  residents,
  administrations,
) {
  const residentsById = new Map();

  residents.forEach((resident) => {
    residentsById.set(resident.id, resident);
  });
  administrations.forEach((administration) => {
    const residentId = getRecordResidentId(administration);

    if (residentId && !residentsById.has(residentId)) {
      residentsById.set(residentId, {
        id: residentId,
        fullName: administration.resident?.fullName ?? "Residente",
      });
    }
  });

  return Array.from(residentsById.values()).sort((first, second) =>
    first.fullName.localeCompare(second.fullName, "pt-BR"),
  );
}

export function buildMedicationAdministrationMedicationOptions(
  medications,
  administrations,
) {
  const medicationsById = new Map();

  medications.forEach((medication) => {
    medicationsById.set(medication.id, medication);
  });
  administrations.forEach((administration) => {
    const medicationId = getRecordMedicationId(administration);

    if (medicationId && !medicationsById.has(medicationId)) {
      medicationsById.set(medicationId, administration.medication);
    }
  });

  return Array.from(medicationsById.values())
    .filter(Boolean)
    .sort((first, second) =>
      getMedicationName(first).localeCompare(getMedicationName(second), "pt-BR"),
    );
}

export function getMedicationAdministrationDisplayStatus(
  administration,
  currentTime,
) {
  return isLateAdministration(administration, currentTime)
    ? "LATE"
    : administration.status ?? "PENDING";
}

export function getRecordMedicationId(administration) {
  return administration.medicationId ?? administration.medication?.id ?? "";
}

export function getUniqueMedicationAdministrationResidentIds({
  administrations,
  prescriptions,
  residents,
}) {
  const residentIds = new Set();

  residents.forEach((resident) => {
    addIfPresent(residentIds, resident.id);
  });
  prescriptions.forEach((prescription) => {
    addIfPresent(residentIds, prescription.residentId);
    addIfPresent(residentIds, prescription.resident?.id);
  });
  administrations.forEach((administration) => {
    addIfPresent(residentIds, getRecordResidentId(administration));
  });

  return Array.from(residentIds);
}

export function getUniqueMedicationAdministrations(administrations) {
  const administrationsById = new Map();

  administrations.forEach((administration) => {
    if (administration?.id) {
      administrationsById.set(administration.id, administration);
    }
  });

  return Array.from(administrationsById.values());
}

export function exportMedicationAdministrationsCsv(
  administrations,
  currentTime,
) {
  const rows = administrations.map((administration) => [
    formatDateTime(administration.scheduledAt),
    administration.resident?.fullName ?? "Residente",
    getMedicationName(administration.medication),
    getDosage(administration),
    administration.caregiver?.fullName ?? "Não registrado",
    getStatusLabel(
      getMedicationAdministrationDisplayStatus(administration, currentTime),
    ),
  ]);
  const csv = [
    ["Data e horário", "Residente", "Medicamento", "Dose", "Cuidador", "Status"],
    ...rows,
  ]
    .map((row) => row.map(escapeCsvValue).join(";"))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "relatorio-administracoes.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function getMedicationAdministrationReportPeriodLabel(periodId) {
  return (
    medicationAdministrationReportPeriods.find((period) => period.id === periodId)
      ?.label ?? "Hoje"
  );
}

export function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

export function startOfDay(date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);

  return nextDate;
}

export function formatDateInput(value) {
  const date = new Date(value);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function matchesMedicationAdministrationStatusFilter(
  administration,
  statusFilter,
  currentTime,
) {
  const status = administration.status ?? "PENDING";

  if (statusFilter === "all") {
    return true;
  }

  if (statusFilter === "LATE") {
    return isLateAdministration(administration, currentTime);
  }

  if (statusFilter === "incidents") {
    return status === "REFUSED" || status === "MISSED";
  }

  return status === statusFilter;
}

function getStatusLabel(status) {
  return status === "LATE"
    ? "Atrasada"
    : administrationStatusLabels[status] ?? status;
}

function escapeCsvValue(value) {
  const text = String(value ?? "");

  if (!/[;"\n]/.test(text)) {
    return text;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

function parseDateInput(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function endOfDay(date) {
  const nextDate = new Date(date);
  nextDate.setHours(23, 59, 59, 999);

  return nextDate;
}

function addIfPresent(set, value) {
  if (value) {
    set.add(value);
  }
}
