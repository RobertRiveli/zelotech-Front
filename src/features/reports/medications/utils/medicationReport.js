import { administrationStatusTone } from "@/features/medication-administrations/constants/administrationStatus";
import { formatMedicationForm } from "@/features/medications/utils/medicationDashboardUtils";
import { getMedicationName } from "@/features/medications/utils/medicationFormatters";
import { formatPrescriptionDosage } from "@/features/prescriptions/utils/prescriptionFormatters";
import { getRecordResidentId } from "@/features/residents/utils/residentDashboardUtils";
import {
  getMedicationAdministrationDisplayStatus,
  getRecordMedicationId,
} from "@/features/reports/utils/medicationAdministrationReport";
import {
  medicationAdministrationReportDistributionItems,
} from "@/features/reports/constants/medicationAdministrationReport";
import { formatDateTime, toDate } from "@/shared/utils/dateFormatter";
import { matchesSearch } from "@/shared/utils/search";
import { normalizeText } from "@/shared/utils/textFormatter";

export function buildMedicationReportItems({
  administrations,
  currentTime,
  medicationFilter,
  medications,
  prescriptions,
  residentFilter,
  searchTerm,
  statusFilter,
}) {
  const medicationsByKey = new Map();
  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      prescription.isActive !== false &&
      matchesMedicationFilter(prescription, medicationFilter) &&
      matchesResidentFilter(prescription, residentFilter),
  );

  medications.forEach((medication) => {
    addMedicationReportItem(medicationsByKey, medication.id, medication);
  });
  filteredPrescriptions.forEach((prescription) => {
    addMedicationReportItem(
      medicationsByKey,
      getRecordMedicationId(prescription),
      prescription.medication,
    );
  });
  administrations.forEach((administration) => {
    addMedicationReportItem(
      medicationsByKey,
      getRecordMedicationId(administration),
      administration.medication,
    );
  });

  filteredPrescriptions.forEach((prescription) => {
    const medicationId = getRecordMedicationId(prescription);
    const item = medicationsByKey.get(medicationId);

    if (!item) {
      return;
    }

    const residentId = getRecordResidentId(prescription);
    const prescriptionSummary = [
      prescription.resident?.fullName,
      formatPrescriptionDosage(prescription),
      prescription.frequency,
    ]
      .filter(Boolean)
      .join(" - ");

    item.activePrescriptions += 1;
    item.searchValues.push(
      prescription.resident?.fullName,
      prescription.frequency,
      prescription.prescribedBy,
      prescription.route,
      prescriptionSummary,
    );

    if (residentId) {
      item.residentIds.add(residentId);
    }

    if (prescriptionSummary) {
      item.prescriptionSummaries.add(prescriptionSummary);
    }
  });

  administrations.forEach((administration) => {
    const medicationId = getRecordMedicationId(administration);
    const item = medicationsByKey.get(medicationId);

    if (!item) {
      return;
    }

    const status = getMedicationAdministrationDisplayStatus(
      administration,
      currentTime,
    );
    const scheduledAt = toDate(administration.scheduledAt);
    const residentId = getRecordResidentId(administration);

    item.total += 1;
    item.statusCounts[status] = (item.statusCounts[status] ?? 0) + 1;
    item.searchValues.push(
      administration.resident?.fullName,
      administration.caregiver?.fullName,
      administration.reason,
      administration.notes,
    );

    if (residentId) {
      item.residentIds.add(residentId);
    }

    if (
      scheduledAt &&
      scheduledAt.getTime() > (item.lastAdministration?.getTime() ?? 0)
    ) {
      item.lastAdministration = scheduledAt;
    }
  });

  const normalizedSearch = normalizeText(searchTerm);
  const includeUnusedMedications =
    residentFilter === "all" && statusFilter === "all";
  const includePrescriptionOnly = statusFilter === "all";

  return Array.from(medicationsByKey.values())
    .map(normalizeMedicationReportItem)
    .filter((item) => {
      if (!matchesMedicationReportItemFilters(item, medicationFilter)) {
        return false;
      }

      if (
        !includeUnusedMedications &&
        item.total === 0 &&
        (!includePrescriptionOnly || item.activePrescriptions === 0)
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return matchesSearch(item.searchValues, normalizedSearch);
    })
    .sort(compareMedicationReportItems);
}

export function buildMedicationReportSummary(items) {
  const residents = new Set();
  const totals = items.reduce(
    (accumulator, item) => {
      item.residentIds.forEach((residentId) => residents.add(residentId));

      return {
        activePrescriptions:
          accumulator.activePrescriptions + item.activePrescriptions,
        administered: accumulator.administered + item.administered,
        occurrences: accumulator.occurrences + item.occurrences,
        total: accumulator.total + item.total,
      };
    },
    {
      activePrescriptions: 0,
      administered: 0,
      occurrences: 0,
      total: 0,
    },
  );

  return {
    ...totals,
    adherenceRate:
      totals.total > 0
        ? Math.round((totals.administered / totals.total) * 100)
        : 0,
    medications: items.length,
    residents: residents.size,
  };
}

export function buildMedicationReportStatusDistribution(items) {
  const statusCounts = items.reduce((accumulator, item) => {
    Object.entries(item.statusCounts).forEach(([status, count]) => {
      accumulator[status] = (accumulator[status] ?? 0) + count;
    });

    return accumulator;
  }, {});
  const total = Math.max(
    Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
    1,
  );

  return medicationAdministrationReportDistributionItems.map((item) => ({
    ...item,
    count: statusCounts[item.id] ?? 0,
    percent: Math.round(((statusCounts[item.id] ?? 0) / total) * 100),
    tone:
      item.id === "LATE"
        ? "danger"
        : administrationStatusTone[item.id] ?? "muted",
  }));
}

export function buildMedicationReportOccurrenceHighlights(items) {
  return items
    .filter((item) => item.occurrences > 0)
    .sort(
      (first, second) =>
        second.occurrences - first.occurrences ||
        second.total - first.total ||
        first.name.localeCompare(second.name, "pt-BR"),
    )
    .slice(0, 5);
}

export function buildMedicationReportPrescriptionHighlights(items) {
  return items
    .filter((item) => item.activePrescriptions > 0)
    .sort(
      (first, second) =>
        second.activePrescriptions - first.activePrescriptions ||
        second.residents - first.residents ||
        first.name.localeCompare(second.name, "pt-BR"),
    )
    .slice(0, 5);
}

export function exportMedicationReportCsv(items) {
  const rows = items.map((item) => [
    item.name,
    item.formLabel,
    item.strength || "",
    item.activePrescriptions,
    item.residents,
    item.total,
    item.administered,
    item.pending,
    item.late,
    item.refused,
    item.missed,
    item.canceled,
    item.occurrences,
    `${item.adherenceRate}%`,
    item.lastAdministrationLabel,
  ]);
  const csv = [
    [
      "Medicamento",
      "Forma",
      "Dosagem",
      "Prescrições ativas",
      "Residentes",
      "Doses no período",
      "Administradas",
      "Pendentes",
      "Atrasadas",
      "Recusadas",
      "Perdidas",
      "Canceladas",
      "Ocorrências",
      "Adesão",
      "Última dose no recorte",
    ],
    ...rows,
  ]
    .map((row) => row.map(escapeCsvValue).join(";"))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "relatorio-medicamentos.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function addMedicationReportItem(medicationsByKey, rawKey, medication) {
  const key = rawKey || getMedicationName(medication);

  if (!key || medicationsByKey.has(key)) {
    return;
  }

  medicationsByKey.set(key, {
    activePrescriptions: 0,
    form: medication?.form ?? "",
    id: medication?.id ?? rawKey,
    key,
    lastAdministration: null,
    medication,
    name: getMedicationName(medication),
    prescriptionSummaries: new Set(),
    residentIds: new Set(),
    searchValues: [
      getMedicationName(medication),
      medication?.genericName,
      medication?.brandName,
      medication?.form,
      medication?.strength,
    ],
    statusCounts: {},
    strength: medication?.strength ?? "",
    total: 0,
  });
}

function normalizeMedicationReportItem(item) {
  const administered = item.statusCounts.ADMINISTERED ?? 0;
  const pending = item.statusCounts.PENDING ?? 0;
  const late = item.statusCounts.LATE ?? 0;
  const refused = item.statusCounts.REFUSED ?? 0;
  const missed = item.statusCounts.MISSED ?? 0;
  const canceled = item.statusCounts.CANCELED ?? 0;
  const occurrences = late + refused + missed + canceled;

  return {
    ...item,
    administered,
    adherenceRate:
      item.total > 0 ? Math.round((administered / item.total) * 100) : 0,
    canceled,
    formLabel: formatMedicationForm(item.form),
    lastAdministrationLabel: formatDateTime(item.lastAdministration, ""),
    late,
    missed,
    occurrences,
    pending,
    prescriptionSummaries: Array.from(item.prescriptionSummaries),
    refused,
    residents: item.residentIds.size,
  };
}

function compareMedicationReportItems(first, second) {
  return (
    second.occurrences - first.occurrences ||
    second.total - first.total ||
    second.activePrescriptions - first.activePrescriptions ||
    first.name.localeCompare(second.name, "pt-BR")
  );
}

function matchesMedicationReportItemFilters(item, medicationFilter) {
  return medicationFilter === "all" || item.key === medicationFilter;
}

function matchesMedicationFilter(record, medicationFilter) {
  return (
    medicationFilter === "all" ||
    getRecordMedicationId(record) === medicationFilter
  );
}

function matchesResidentFilter(record, residentFilter) {
  return residentFilter === "all" || getRecordResidentId(record) === residentFilter;
}

function escapeCsvValue(value) {
  const text = String(value ?? "");

  if (!/[;"\n]/.test(text)) {
    return text;
  }

  return `"${text.replace(/"/g, '""')}"`;
}
