import { normalizeText } from "@/shared/utils/textFormatter";
import { matchesSearch } from "@/shared/utils/search";
import { getMedicationName } from "@/features/medications/utils/medicationFormatters";
import { countByStatus, isLateAdministration } from "@/features/medication-administrations/utils/administrationStatus";
import { compareByScheduledAt } from "@/features/medication-administrations/utils/administrationSorters";
import { compareByStartDate } from "@/features/prescriptions/utils/prescriptionSorters";
import { isPrescriptionEndingSoon } from "@/features/prescriptions/utils/prescriptionDashboardUtils";
import {
  compareByAdmissionDate,
  compareByFullName,
} from "@/features/residents/utils/residentSorters";

export function buildDashboardSummary(data, searchTerm, currentTime) {
  const normalizedSearch = normalizeText(searchTerm);
  const administrations = [...data.administrations].sort(compareByScheduledAt);
  const prescriptions = [...data.prescriptions].sort(compareByStartDate);
  const residents = [...data.residents].sort(compareByFullName);
  const recentResidents = [...data.residents].sort(compareByAdmissionDate);
  const statusCounts = countByStatus(administrations);
  const pendingAdministrations = statusCounts.PENDING ?? 0;
  const administeredAdministrations = statusCounts.ADMINISTERED ?? 0;
  const totalAdministrations = administrations.length;
  const lateAdministrations = administrations.filter((administration) =>
    isLateAdministration(administration, currentTime),
  ).length;
  const incidentAdministrations =
    (statusCounts.REFUSED ?? 0) + (statusCounts.MISSED ?? 0);
  const endingSoonPrescriptions = prescriptions.filter((prescription) =>
    isPrescriptionEndingSoon(prescription, currentTime),
  );
  const completionRate =
    totalAdministrations === 0
      ? 0
      : Math.round((administeredAdministrations / totalAdministrations) * 100);
  const filteredAdministrations = administrations.filter((administration) =>
    matchesSearch(
      [
        administration.resident?.fullName,
        getMedicationName(administration.medication),
        administration.prescription?.frequency,
      ],
      normalizedSearch,
    ),
  );
  const filteredPrescriptions = prescriptions.filter((prescription) =>
    matchesSearch(
      [
        prescription.resident?.fullName,
        getMedicationName(prescription.medication),
        prescription.frequency,
      ],
      normalizedSearch,
    ),
  );
  const filteredResidents = residents.filter((resident) =>
    matchesSearch(
      [
        resident.fullName,
        resident.cpf,
        resident.bloodType,
        resident.gender,
        resident.status,
      ],
      normalizedSearch,
    ),
  );
  const alerts = buildAlerts({
    lateAdministrations,
    incidentAdministrations,
    endingSoonPrescriptions,
  });

  return {
    alerts,
    completionRate,
    endingSoonPrescriptions,
    filteredAdministrations,
    filteredPrescriptions,
    filteredResidents,
    lateAdministrations,
    pendingAdministrations,
    recentResidents: recentResidents.slice(0, 5),
    statusCounts,
    totalAdministrations,
  };
}

export function buildAlerts({
  lateAdministrations,
  incidentAdministrations,
  endingSoonPrescriptions,
}) {
  const alerts = [];

  if (lateAdministrations > 0) {
    alerts.push({
      id: "late-administrations",
      label: "Administrações atrasadas",
      value: lateAdministrations,
      detail: "exigem conferência da equipe",
      tone: "danger",
    });
  }

  if (incidentAdministrations > 0) {
    alerts.push({
      id: "incident-administrations",
      label: "Recusas ou perdas",
      value: incidentAdministrations,
      detail: "registradas na agenda de hoje",
      tone: "warning",
    });
  }

  if (endingSoonPrescriptions.length > 0) {
    alerts.push({
      id: "ending-prescriptions",
      label: "Prescrições encerrando",
      value: endingSoonPrescriptions.length,
      detail: "nos próximos 7 dias",
      tone: "info",
    });
  }

  return alerts;
}
