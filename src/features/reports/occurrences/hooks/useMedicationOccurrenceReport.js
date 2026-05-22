import { useMemo } from "react";
import { useMedicationAdministrationReport } from "@/features/reports/hooks/useMedicationAdministrationReport";
import {
  buildMedicationAdministrationAttentionMedications,
  buildMedicationAdministrationOccurrenceDistribution,
  buildMedicationAdministrationOccurrenceResidentHighlights,
  buildMedicationAdministrationOccurrenceStats,
  exportMedicationAdministrationOccurrencesCsv,
  filterMedicationAdministrationOccurrences,
} from "@/features/reports/utils/medicationAdministrationReport";

export function useMedicationOccurrenceReport({
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
  const filteredAdministrations = useMemo(
    () =>
      filterMedicationAdministrationOccurrences(
        report.filteredAdministrations,
        currentTime,
      ),
    [currentTime, report.filteredAdministrations],
  );
  const stats = useMemo(
    () =>
      buildMedicationAdministrationOccurrenceStats(
        filteredAdministrations,
        currentTime,
      ),
    [currentTime, filteredAdministrations],
  );
  const distribution = useMemo(
    () =>
      buildMedicationAdministrationOccurrenceDistribution(
        filteredAdministrations,
        currentTime,
      ),
    [currentTime, filteredAdministrations],
  );
  const attentionMedications = useMemo(
    () =>
      buildMedicationAdministrationAttentionMedications(
        filteredAdministrations,
        currentTime,
      ),
    [currentTime, filteredAdministrations],
  );
  const residentHighlights = useMemo(
    () =>
      buildMedicationAdministrationOccurrenceResidentHighlights(
        filteredAdministrations,
        currentTime,
      ),
    [currentTime, filteredAdministrations],
  );

  function exportCsv() {
    exportMedicationAdministrationOccurrencesCsv(
      filteredAdministrations,
      currentTime,
    );
  }

  return {
    ...report,
    attentionMedications,
    distribution,
    exportCsv,
    filteredAdministrations,
    residentHighlights,
    stats,
  };
}
