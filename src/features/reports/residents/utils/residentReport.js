import {
  administrationStatusLabels,
  administrationStatusTone,
} from "@/features/medication-administrations/constants/administrationStatus";
import { countByStatus } from "@/features/medication-administrations/utils/administrationStatus";
import {
  getDosage,
  getMedicationName,
} from "@/features/medications/utils/medicationFormatters";
import { formatPrescriptionDosage } from "@/features/prescriptions/utils/prescriptionFormatters";
import { getRecordResidentId } from "@/features/residents/utils/residentDashboardUtils";
import {
  buildMedicationAdministrationReportStats,
  getMedicationAdministrationDisplayStatus,
  getMedicationAdministrationReportPeriodLabel,
} from "@/features/reports/utils/medicationAdministrationReport";
import { formatDateRange, formatDateTime, toDate } from "@/shared/utils/dateFormatter";

export function buildResidentReportResidentOptions({
  administrations,
  prescriptions,
  residents,
}) {
  const residentsById = new Map();

  residents.forEach((resident) => {
    if (resident?.id) {
      residentsById.set(resident.id, resident);
    }
  });

  prescriptions.forEach((prescription) => {
    addResidentOption(residentsById, {
      id: getRecordResidentId(prescription),
      fullName: prescription.resident?.fullName,
    });
  });

  administrations.forEach((administration) => {
    addResidentOption(residentsById, {
      id: getRecordResidentId(administration),
      fullName: administration.resident?.fullName,
    });
  });

  return Array.from(residentsById.values()).sort((first, second) =>
    getResidentName(first).localeCompare(getResidentName(second), "pt-BR"),
  );
}

export function buildResidentReportStats({
  administrations,
  currentTime,
  healthConditions,
  prescriptions,
}) {
  const administrationStats = buildMedicationAdministrationReportStats(
    administrations,
    currentTime,
  );
  const statusCounts = countByStatus(administrations);

  return {
    ...administrationStats,
    activePrescriptions: prescriptions.length,
    canceled: statusCounts.CANCELED ?? 0,
    healthConditions: healthConditions.length,
    missed: statusCounts.MISSED ?? 0,
    pending: statusCounts.PENDING ?? 0,
    refused: statusCounts.REFUSED ?? 0,
  };
}

export function buildResidentReportTimeline(administrations, currentTime) {
  return administrations
    .map((administration) => {
      const status = getMedicationAdministrationDisplayStatus(
        administration,
        currentTime,
      );
      const details = [
        getDosage(administration),
        administration.prescription?.route,
        administration.prescription?.frequency,
      ].filter(Boolean);
      const context = [
        administration.administeredAt
          ? `Administrada em ${formatDateTime(administration.administeredAt)}`
          : "",
        administration.caregiver?.fullName
          ? `Cuidador: ${administration.caregiver.fullName}`
          : "",
        administration.reason ? `Motivo: ${administration.reason}` : "",
        administration.notes ? `Observação: ${administration.notes}` : "",
      ].filter(Boolean);

      return {
        context,
        date: administration.scheduledAt,
        detail: details.join(" · ") || "Dose registrada",
        id: administration.id,
        medicationName: getMedicationName(administration.medication),
        status,
        statusLabel: getResidentReportStatusLabel(status),
        statusTone: getResidentReportStatusTone(status),
      };
    })
    .sort((first, second) => {
      const firstTime = toDate(first.date)?.getTime() ?? 0;
      const secondTime = toDate(second.date)?.getTime() ?? 0;

      return secondTime - firstTime;
    });
}

export function exportResidentReportCsv({
  administrations,
  currentTime,
  resident,
}) {
  const rows = administrations.map((administration) => {
    const status = getMedicationAdministrationDisplayStatus(
      administration,
      currentTime,
    );

    return [
      formatDateTime(administration.scheduledAt),
      resident?.fullName ?? administration.resident?.fullName ?? "Residente",
      getMedicationName(administration.medication),
      getDosage(administration),
      getResidentReportStatusLabel(status),
      administration.caregiver?.fullName ?? "Não registrado",
      formatDateTime(administration.administeredAt, ""),
      administration.reason ?? "",
      administration.notes ?? "",
    ];
  });
  const csv = [
    [
      "Data prevista",
      "Residente",
      "Medicamento",
      "Dose",
      "Status",
      "Cuidador",
      "Administrado em",
      "Motivo",
      "Observação",
    ],
    ...rows,
  ]
    .map((row) => row.map(escapeCsvValue).join(";"))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `historico-residente-${getCsvFilePart(resident?.fullName)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function formatResidentReportPrescriptionPeriod(prescription) {
  return formatDateRange(prescription.startDate, prescription.endDate);
}

export function getResidentReportPrescriptionSummary(prescription) {
  return [
    formatPrescriptionDosage(prescription),
    prescription.frequency,
    prescription.prescribedBy,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function getResidentReportPeriodLabel(periodId) {
  return getMedicationAdministrationReportPeriodLabel(periodId);
}

export function getResidentReportStatusLabel(status) {
  return status === "LATE"
    ? "Atrasada"
    : administrationStatusLabels[status] ?? status;
}

export function getResidentReportStatusTone(status) {
  return status === "LATE"
    ? "danger"
    : administrationStatusTone[status] ?? "muted";
}

export function getResidentName(resident) {
  return resident?.fullName ?? "Residente";
}

function addResidentOption(residentsById, resident) {
  if (!resident.id || residentsById.has(resident.id)) {
    return;
  }

  residentsById.set(resident.id, {
    id: resident.id,
    fullName: resident.fullName ?? "Residente",
  });
}

function escapeCsvValue(value) {
  const text = String(value ?? "");

  if (!/[;"\n]/.test(text)) {
    return text;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

function getCsvFilePart(value) {
  return String(value || "residente")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
