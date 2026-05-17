import { useCallback, useEffect, useMemo, useState } from "react";
import { listResidentMedicationAdministrations } from "@/features/medication-administrations/api/medicationAdministrationService";
import { compareByScheduledAtDesc } from "@/features/medication-administrations/utils/administrationSorters";
import { getRequestErrorMessage } from "@/shared/utils/formErrors";
import {
  addDays,
  buildMedicationAdministrationAttentionMedications,
  buildMedicationAdministrationMedicationOptions,
  buildMedicationAdministrationPeriodRange,
  buildMedicationAdministrationReportStats,
  buildMedicationAdministrationResidentOptions,
  buildMedicationAdministrationStatusDistribution,
  exportMedicationAdministrationsCsv,
  filterMedicationAdministrationReport,
  formatDateInput,
  getUniqueMedicationAdministrationResidentIds,
  getUniqueMedicationAdministrations,
  startOfDay,
} from "@/features/reports/utils/medicationAdministrationReport";

export function useMedicationAdministrationReport({
  administrations,
  currentTime,
  isLoading,
  medications,
  prescriptions,
  residents,
  searchTerm,
}) {
  const [periodId, setPeriodId] = useState("today");
  const [customStartDate, setCustomStartDate] = useState(() =>
    formatDateInput(addDays(startOfDay(new Date()), -6)),
  );
  const [customEndDate, setCustomEndDate] = useState(() =>
    formatDateInput(new Date()),
  );
  const [residentFilter, setResidentFilter] = useState("all");
  const [medicationFilter, setMedicationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [localSearch, setLocalSearch] = useState("");
  const [periodAdministrations, setPeriodAdministrations] = useState([]);
  const [periodStatus, setPeriodStatus] = useState({
    error: "",
    isLoading: false,
  });
  const currentDateKey = formatDateInput(new Date(currentTime));
  const residentIds = useMemo(
    () =>
      getUniqueMedicationAdministrationResidentIds({
        administrations,
        prescriptions,
        residents,
      }),
    [administrations, prescriptions, residents],
  );
  const periodRange = useMemo(
    () =>
      buildMedicationAdministrationPeriodRange({
        customEndDate,
        customStartDate,
        currentDateKey,
        periodId,
      }),
    [customEndDate, customStartDate, currentDateKey, periodId],
  );
  const reportAdministrations =
    periodId === "today" ? administrations : periodAdministrations;
  const filteredAdministrations = useMemo(
    () =>
      filterMedicationAdministrationReport(reportAdministrations, {
        currentTime,
        medicationFilter,
        periodRange,
        residentFilter,
        searchTerm: [searchTerm, localSearch].filter(Boolean).join(" "),
        statusFilter,
      }).sort(compareByScheduledAtDesc),
    [
      currentTime,
      localSearch,
      medicationFilter,
      periodRange,
      reportAdministrations,
      residentFilter,
      searchTerm,
      statusFilter,
    ],
  );
  const stats = useMemo(
    () => buildMedicationAdministrationReportStats(filteredAdministrations, currentTime),
    [currentTime, filteredAdministrations],
  );
  const distribution = useMemo(
    () =>
      buildMedicationAdministrationStatusDistribution(
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
  const residentOptions = useMemo(
    () => buildMedicationAdministrationResidentOptions(residents, reportAdministrations),
    [reportAdministrations, residents],
  );
  const medicationOptions = useMemo(
    () =>
      buildMedicationAdministrationMedicationOptions(
        medications,
        reportAdministrations,
      ),
    [medications, reportAdministrations],
  );
  const isBusy = isLoading || (periodId !== "today" && periodStatus.isLoading);
  const reportError = periodId !== "today" ? periodStatus.error : "";

  const loadPeriodAdministrations = useCallback(async () => {
    if (residentIds.length === 0) {
      setPeriodAdministrations([]);
      setPeriodStatus({
        error: "Não há residentes disponíveis para montar este período.",
        isLoading: false,
      });
      return;
    }

    setPeriodStatus({ error: "", isLoading: true });

    try {
      const settledRequests = await Promise.allSettled(
        residentIds.map((residentId) =>
          listResidentMedicationAdministrations(residentId, {
            endDate: periodRange.endDate.toISOString(),
            startDate: periodRange.startDate.toISOString(),
          }),
        ),
      );
      const fulfilledRequests = settledRequests.filter(
        (request) => request.status === "fulfilled",
      );

      if (fulfilledRequests.length === 0) {
        const rejectedRequest = settledRequests.find(
          (request) => request.status === "rejected",
        );

        throw rejectedRequest?.reason ?? new Error("Falha ao carregar relatório.");
      }

      setPeriodAdministrations(
        getUniqueMedicationAdministrations(
          fulfilledRequests.flatMap((request) => request.value),
        ),
      );
      setPeriodStatus({ error: "", isLoading: false });
    } catch (error) {
      setPeriodAdministrations([]);
      setPeriodStatus({
        error: getRequestErrorMessage(
          error,
          "Não foi possível carregar o relatório de administrações.",
        ),
        isLoading: false,
      });
    }
  }, [periodRange.endDate, periodRange.startDate, residentIds]);

  useEffect(() => {
    if (periodId === "today") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      loadPeriodAdministrations();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadPeriodAdministrations, periodId]);

  function exportCsv() {
    exportMedicationAdministrationsCsv(filteredAdministrations, currentTime);
  }

  return {
    attentionMedications,
    customEndDate,
    customStartDate,
    distribution,
    exportCsv,
    filteredAdministrations,
    isBusy,
    localSearch,
    medicationFilter,
    medicationOptions,
    periodId,
    reportError,
    residentFilter,
    residentOptions,
    setCustomEndDate,
    setCustomStartDate,
    setLocalSearch,
    setMedicationFilter,
    setPeriodId,
    setResidentFilter,
    setStatusFilter,
    stats,
    statusFilter,
  };
}
