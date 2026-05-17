import { useCallback, useEffect, useMemo, useState } from "react";
import { listResidentMedicationAdministrations } from "@/features/medication-administrations/api/medicationAdministrationService";
import { compareByScheduledAtDesc } from "@/features/medication-administrations/utils/administrationSorters";
import { listPrescriptionsByResident } from "@/features/prescriptions/api/prescriptionService";
import { getRecordResidentId } from "@/features/residents/utils/residentDashboardUtils";
import { getResidentOverview } from "@/features/residents/api/residentService";
import { getRequestErrorMessage } from "@/shared/utils/formErrors";
import {
  addDays,
  buildMedicationAdministrationPeriodRange,
  buildMedicationAdministrationStatusDistribution,
  filterMedicationAdministrationReport,
  formatDateInput,
  startOfDay,
} from "@/features/reports/utils/medicationAdministrationReport";
import {
  buildResidentReportResidentOptions,
  buildResidentReportStats,
  buildResidentReportTimeline,
  exportResidentReportCsv,
} from "@/features/reports/residents/utils/residentReport";

export function useResidentReport({
  administrations,
  currentTime,
  isLoading,
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
  const [residentFilter, setResidentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [localSearch, setLocalSearch] = useState("");
  const [overviewsByResidentId, setOverviewsByResidentId] = useState({});
  const [overviewStatus, setOverviewStatus] = useState({
    error: "",
    isLoading: false,
    residentId: "",
  });
  const [prescriptionsByResidentId, setPrescriptionsByResidentId] = useState({});
  const [prescriptionStatus, setPrescriptionStatus] = useState({
    error: "",
    isLoading: false,
    residentId: "",
  });
  const [periodAdministrations, setPeriodAdministrations] = useState([]);
  const [periodStatus, setPeriodStatus] = useState({
    error: "",
    isLoading: false,
    requestKey: "",
  });
  const currentDateKey = formatDateInput(new Date(currentTime));
  const residentOptions = useMemo(
    () =>
      buildResidentReportResidentOptions({
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
  const selectedResidentId = useMemo(() => {
    const residentExists = residentOptions.some(
      (resident) => resident.id === residentFilter,
    );

    return residentExists ? residentFilter : residentOptions[0]?.id ?? "";
  }, [residentFilter, residentOptions]);
  const periodRequestKey = [
    selectedResidentId,
    periodRange.startDate.toISOString(),
    periodRange.endDate.toISOString(),
  ].join(":");
  const selectedResidentOption = useMemo(
    () =>
      residentOptions.find((resident) => resident.id === selectedResidentId) ??
      null,
    [residentOptions, selectedResidentId],
  );
  const residentOverview = selectedResidentId
    ? overviewsByResidentId[selectedResidentId]
    : null;
  const selectedResident =
    residentOverview?.resident ?? selectedResidentOption ?? null;
  const activeOverviewStatus =
    overviewStatus.residentId === selectedResidentId
      ? overviewStatus
      : { error: "", isLoading: false, residentId: selectedResidentId };
  const activePrescriptionStatus =
    prescriptionStatus.residentId === selectedResidentId
      ? prescriptionStatus
      : { error: "", isLoading: false, residentId: selectedResidentId };
  const activePeriodStatus =
    periodStatus.requestKey === periodRequestKey
      ? periodStatus
      : { error: "", isLoading: false, requestKey: periodRequestKey };
  const overviewPrescriptions = residentOverview?.prescriptions ?? null;
  const fetchedPrescriptions = selectedResidentId
    ? prescriptionsByResidentId[selectedResidentId]
    : null;
  const fallbackPrescriptions = useMemo(
    () =>
      selectedResidentId
        ? prescriptions.filter(
            (prescription) =>
              getRecordResidentId(prescription) === selectedResidentId,
          )
        : [],
    [prescriptions, selectedResidentId],
  );
  const residentPrescriptions =
    overviewPrescriptions ?? fetchedPrescriptions ?? fallbackPrescriptions;
  const healthConditions = useMemo(
    () => residentOverview?.healthConditions ?? [],
    [residentOverview?.healthConditions],
  );
  const reportAdministrations =
    periodId === "today" ? administrations : periodAdministrations;
  const filteredAdministrations = useMemo(
    () =>
      selectedResidentId
        ? filterMedicationAdministrationReport(reportAdministrations, {
            currentTime,
            medicationFilter: "all",
            periodRange,
            residentFilter: selectedResidentId,
            searchTerm: [searchTerm, localSearch].filter(Boolean).join(" "),
            statusFilter,
          }).sort(compareByScheduledAtDesc)
        : [],
    [
      currentTime,
      localSearch,
      periodRange,
      reportAdministrations,
      searchTerm,
      selectedResidentId,
      statusFilter,
    ],
  );
  const stats = useMemo(
    () =>
      buildResidentReportStats({
        administrations: filteredAdministrations,
        currentTime,
        healthConditions,
        prescriptions: residentPrescriptions,
      }),
    [currentTime, filteredAdministrations, healthConditions, residentPrescriptions],
  );
  const distribution = useMemo(
    () =>
      buildMedicationAdministrationStatusDistribution(
        filteredAdministrations,
        currentTime,
      ),
    [currentTime, filteredAdministrations],
  );
  const timelineEvents = useMemo(
    () => buildResidentReportTimeline(filteredAdministrations, currentTime),
    [currentTime, filteredAdministrations],
  );
  const isBusy =
    isLoading ||
    activeOverviewStatus.isLoading ||
    activePrescriptionStatus.isLoading ||
    (periodId !== "today" && activePeriodStatus.isLoading);
  const reportError = [
    activeOverviewStatus.error,
    activePrescriptionStatus.error,
    periodId !== "today" ? activePeriodStatus.error : "",
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    if (!selectedResidentId || overviewsByResidentId[selectedResidentId]) {
      return undefined;
    }

    let isMounted = true;

    async function loadResidentOverview() {
      setOverviewStatus({
        error: "",
        isLoading: true,
        residentId: selectedResidentId,
      });

      try {
        const overview = await getResidentOverview(selectedResidentId);

        if (!isMounted) {
          return;
        }

        setOverviewsByResidentId((currentOverviews) => ({
          ...currentOverviews,
          [selectedResidentId]: overview,
        }));
        setOverviewStatus({
          error: "",
          isLoading: false,
          residentId: selectedResidentId,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setOverviewStatus({
          error: getRequestErrorMessage(
            error,
            "Não foi possível carregar os dados do residente.",
          ),
          isLoading: false,
          residentId: selectedResidentId,
        });
      }
    }

    loadResidentOverview();

    return () => {
      isMounted = false;
    };
  }, [overviewsByResidentId, selectedResidentId]);

  useEffect(() => {
    if (
      !selectedResidentId ||
      residentOverview?.prescriptions ||
      prescriptionsByResidentId[selectedResidentId]
    ) {
      return undefined;
    }

    let isMounted = true;

    async function loadResidentPrescriptions() {
      setPrescriptionStatus({
        error: "",
        isLoading: true,
        residentId: selectedResidentId,
      });

      try {
        const nextPrescriptions =
          await listPrescriptionsByResident(selectedResidentId);

        if (!isMounted) {
          return;
        }

        setPrescriptionsByResidentId((currentPrescriptions) => ({
          ...currentPrescriptions,
          [selectedResidentId]: nextPrescriptions,
        }));
        setPrescriptionStatus({
          error: "",
          isLoading: false,
          residentId: selectedResidentId,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setPrescriptionStatus({
          error: getRequestErrorMessage(
            error,
            "Não foi possível carregar as prescrições do residente.",
          ),
          isLoading: false,
          residentId: selectedResidentId,
        });
      }
    }

    loadResidentPrescriptions();

    return () => {
      isMounted = false;
    };
  }, [
    prescriptionsByResidentId,
    residentOverview?.prescriptions,
    selectedResidentId,
  ]);

  const loadPeriodAdministrations = useCallback(async () => {
    if (!selectedResidentId) {
      setPeriodAdministrations([]);
      setPeriodStatus({
        error: "",
        isLoading: false,
        requestKey: periodRequestKey,
      });
      return;
    }

    setPeriodStatus({
      error: "",
      isLoading: true,
      requestKey: periodRequestKey,
    });

    try {
      const nextAdministrations = await listResidentMedicationAdministrations(
        selectedResidentId,
        {
          endDate: periodRange.endDate.toISOString(),
          startDate: periodRange.startDate.toISOString(),
        },
      );

      setPeriodAdministrations(nextAdministrations);
      setPeriodStatus({
        error: "",
        isLoading: false,
        requestKey: periodRequestKey,
      });
    } catch (error) {
      setPeriodAdministrations([]);
      setPeriodStatus({
        error: getRequestErrorMessage(
          error,
          "Não foi possível carregar as administrações do residente.",
        ),
        isLoading: false,
        requestKey: periodRequestKey,
      });
    }
  }, [
    periodRange.endDate,
    periodRange.startDate,
    periodRequestKey,
    selectedResidentId,
  ]);

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
    exportResidentReportCsv({
      administrations: filteredAdministrations,
      currentTime,
      resident: selectedResident,
    });
  }

  return {
    customEndDate,
    customStartDate,
    distribution,
    exportCsv,
    filteredAdministrations,
    healthConditions,
    isBusy,
    localSearch,
    periodId,
    reportError,
    residentFilter: selectedResidentId,
    residentOptions,
    residentPrescriptions,
    selectedResident,
    setCustomEndDate,
    setCustomStartDate,
    setLocalSearch,
    setPeriodId,
    setResidentFilter,
    setStatusFilter,
    stats,
    statusFilter,
    timelineEvents,
  };
}
