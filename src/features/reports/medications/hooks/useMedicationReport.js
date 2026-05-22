import { useMemo } from "react";
import { useMedicationAdministrationReport } from "@/features/reports/hooks/useMedicationAdministrationReport";
import {
  buildMedicationReportItems,
  buildMedicationReportOccurrenceHighlights,
  buildMedicationReportPrescriptionHighlights,
  buildMedicationReportStatusDistribution,
  buildMedicationReportSummary,
  exportMedicationReportCsv,
} from "@/features/reports/medications/utils/medicationReport";

export function useMedicationReport({
  administrations,
  currentTime,
  isLoading,
  medications,
  prescriptions,
  residents,
  searchTerm,
}) {
  const report = useMedicationAdministrationReport({
    administrations,
    currentTime,
    isLoading,
    medications,
    prescriptions,
    residents,
    searchTerm,
  });
  const medicationItems = useMemo(
    () =>
      buildMedicationReportItems({
        administrations: report.filteredAdministrations,
        currentTime,
        medicationFilter: report.medicationFilter,
        medications,
        prescriptions,
        residentFilter: report.residentFilter,
        searchTerm: [searchTerm, report.localSearch].filter(Boolean).join(" "),
        statusFilter: report.statusFilter,
      }),
    [
      currentTime,
      medications,
      prescriptions,
      report.filteredAdministrations,
      report.localSearch,
      report.medicationFilter,
      report.residentFilter,
      report.statusFilter,
      searchTerm,
    ],
  );
  const summary = useMemo(
    () => buildMedicationReportSummary(medicationItems),
    [medicationItems],
  );
  const distribution = useMemo(
    () => buildMedicationReportStatusDistribution(medicationItems),
    [medicationItems],
  );
  const occurrenceHighlights = useMemo(
    () => buildMedicationReportOccurrenceHighlights(medicationItems),
    [medicationItems],
  );
  const prescriptionHighlights = useMemo(
    () => buildMedicationReportPrescriptionHighlights(medicationItems),
    [medicationItems],
  );

  function exportCsv() {
    exportMedicationReportCsv(medicationItems);
  }

  return {
    ...report,
    distribution,
    exportCsv,
    medicationItems,
    occurrenceHighlights,
    prescriptionHighlights,
    summary,
  };
}
