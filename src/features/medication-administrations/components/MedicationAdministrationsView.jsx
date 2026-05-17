import { useCallback, useEffect, useMemo, useState } from "react";
import {
  administerMedicationAdministration,
  cancelMedicationAdministration,
  createManualMedicationAdministration,
  getMedicationAdministrationById,
  listResidentMedicationAdministrations,
  listTodayMedicationAdministrations,
  missMedicationAdministration,
  refuseMedicationAdministration,
} from "@/features/medication-administrations/api/medicationAdministrationService";
import {
  administrationFilters,
  buildAdministrationFilterCounts,
  buildAdministrationStats,
  filterAdministrations,
  getAdministrationFilterLabel,
  isPendingAdministration,
} from "@/features/medication-administrations/utils/administrationDashboardUtils";
import {
  createAdministrationActionForm,
  createEmptyAdministrationActionForm,
  createEmptyManualAdministrationForm,
} from "@/features/medication-administrations/utils/administrationForms";
import {
  compareByAdministrationPriority,
  compareByScheduledAtDesc,
} from "@/features/medication-administrations/utils/administrationSorters";
import {
  validateAdministrationActionForm,
  validateManualAdministrationForm,
} from "@/features/medication-administrations/validations/administrationSchema";
import {
  clearFieldError,
  getRequestErrorMessage,
} from "@/shared/utils/formErrors";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingRows } from "@/shared/ui/LoadingRows";
import { MetricCard } from "@/shared/ui/MetricCard";
import { PanelHeader } from "@/shared/ui/PanelHeader";
import { AdministrationActionModal } from "./AdministrationActionModal";
import { AdministrationDetailModal } from "./AdministrationDetailModal";
import { AdministrationRow } from "./AdministrationRow";
import { ManualAdministrationModal } from "./ManualAdministrationModal";
import "./MedicationAdministrationsView.css";

const actionHandlers = {
  administer: administerMedicationAdministration,
  cancel: cancelMedicationAdministration,
  miss: missMedicationAdministration,
  refuse: refuseMedicationAdministration,
};

const actionFeedback = {
  administer: "Administração marcada como administrada.",
  cancel: "Administração cancelada com sucesso.",
  miss: "Administração marcada como perdida.",
  refuse: "Administração marcada como recusada.",
};

const administrationTabs = [
  { id: "today", label: "Hoje" },
  { id: "future", label: "Futuras" },
  { id: "history", label: "Histórico" },
];

const administrationTabContent = {
  today: {
    administeredDetail: "concluídas hoje",
    emptyTitle: "Nenhuma administração encontrada para o filtro atual.",
    heroDescription:
      "Acompanhe as administrações previstas para hoje, priorize atrasos e registre o desfecho operacional de cada dose.",
    panelTitle: "Administrações de hoje",
    periodLabel: "Agenda",
    secondarySummary: (stats) => `${stats.late} atrasadas`,
    totalDetail: "visíveis no filtro",
    totalLabel: "Total do dia",
  },
  future: {
    administeredDetail: "já concluídas no período",
    emptyTitle: "Nenhuma administração futura encontrada para o filtro atual.",
    heroDescription:
      "Veja as doses já programadas para os próximos dias e antecipe ajustes operacionais quando necessário.",
    panelTitle: "Próximas administrações",
    periodLabel: "Próximos 7 dias",
    secondarySummary: (stats) => `${stats.total} agendadas`,
    totalDetail: "visíveis no filtro",
    totalLabel: "Total futuro",
  },
  history: {
    administeredDetail: "concluídas no período",
    emptyTitle: "Nenhuma administração no histórico para o filtro atual.",
    heroDescription:
      "Consulte os registros recentes de administração e acompanhe pendências que ficaram sem desfecho.",
    panelTitle: "Histórico de administrações",
    periodLabel: "Últimos 7 dias",
    secondarySummary: (stats) => `${stats.late} sem desfecho`,
    totalDetail: "visíveis no filtro",
    totalLabel: "Total histórico",
  },
};

const initialPeriodAdministrations = {
  future: [],
  history: [],
};

const initialPeriodStatus = {
  future: { error: "", hasLoaded: false, isLoading: false },
  history: { error: "", hasLoaded: false, isLoading: false },
};

const periodTabIds = ["future", "history"];
const periodWindowDays = 7;

export function MedicationAdministrationsView({
  administrations,
  currentTime,
  isAdmin,
  isLoading,
  onAdministrationsChange,
  prescriptions,
  residents,
  searchTerm,
}) {
  const [activeTab, setActiveTab] = useState("today");
  const [activeFilter, setActiveFilter] = useState("all");
  const [periodAdministrations, setPeriodAdministrations] = useState(
    initialPeriodAdministrations,
  );
  const [periodStatus, setPeriodStatus] = useState(initialPeriodStatus);
  const [selectedAdministrationId, setSelectedAdministrationId] = useState("");
  const [selectedAdministration, setSelectedAdministration] = useState(null);
  const [detailStatus, setDetailStatus] = useState({
    error: "",
    isLoading: false,
  });
  const [actionState, setActionState] = useState(null);
  const [actionForm, setActionForm] = useState(() =>
    createEmptyAdministrationActionForm(),
  );
  const [actionErrors, setActionErrors] = useState({});
  const [actionSubmitError, setActionSubmitError] = useState("");
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState(() =>
    createEmptyManualAdministrationForm(),
  );
  const [manualErrors, setManualErrors] = useState({});
  const [manualSubmitError, setManualSubmitError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [refreshError, setRefreshError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const residentIds = useMemo(
    () =>
      getUniqueResidentIds({
        administrations,
        prescriptions,
        residents,
      }),
    [administrations, prescriptions, residents],
  );
  const activeTabContent =
    administrationTabContent[activeTab] ?? administrationTabContent.today;
  const activePeriodStatus =
    periodStatus[activeTab] ?? { error: "", hasLoaded: true, isLoading: false };
  const activeAdministrations = useMemo(
    () =>
      activeTab === "today"
        ? administrations
        : periodAdministrations[activeTab] ?? [],
    [activeTab, administrations, periodAdministrations],
  );
  const tabs = useMemo(
    () =>
      administrationTabs.map((tab) => {
        const count =
          tab.id === "today"
            ? administrations.length
            : periodAdministrations[tab.id]?.length ?? 0;
        const countLabel =
          tab.id === "today" || periodStatus[tab.id]?.hasLoaded
            ? String(count)
            : "...";

        return {
          ...tab,
          countLabel,
        };
      }),
    [administrations.length, periodAdministrations, periodStatus],
  );
  const sortedAdministrations = useMemo(
    () => {
      const nextAdministrations = [...activeAdministrations];

      if (activeTab === "history") {
        return nextAdministrations.sort(compareByScheduledAtDesc);
      }

      return nextAdministrations.sort(compareByAdministrationPriority(currentTime));
    },
    [activeAdministrations, activeTab, currentTime],
  );
  const stats = useMemo(
    () => buildAdministrationStats(sortedAdministrations, currentTime),
    [currentTime, sortedAdministrations],
  );
  const filterCounts = useMemo(
    () => buildAdministrationFilterCounts(sortedAdministrations, currentTime),
    [currentTime, sortedAdministrations],
  );
  const filteredAdministrations = useMemo(
    () =>
      filterAdministrations(sortedAdministrations, {
        currentTime,
        filterId: activeFilter,
        searchTerm,
      }),
    [activeFilter, currentTime, searchTerm, sortedAdministrations],
  );
  const activeFilterLabel = getAdministrationFilterLabel(activeFilter);
  const isBusy =
    isLoading ||
    isRefreshing ||
    (activeTab !== "today" && activePeriodStatus.isLoading);
  const activeError =
    activeTab === "today" ? refreshError : activePeriodStatus.error || refreshError;

  const fetchPeriodAdministrations = useCallback(
    async (tabId) => {
      if (residentIds.length === 0) {
        return [];
      }

      const filters = buildAdministrationPeriodFilters(tabId, currentTime);
      const settledRequests = await Promise.allSettled(
        residentIds.map((residentId) =>
          listResidentMedicationAdministrations(residentId, filters),
        ),
      );
      const fulfilledRequests = settledRequests.filter(
        (request) => request.status === "fulfilled",
      );

      if (fulfilledRequests.length === 0) {
        const rejectedRequest = settledRequests.find(
          (request) => request.status === "rejected",
        );

        throw rejectedRequest?.reason ?? new Error("Não foi possível carregar.");
      }

      return getUniqueAdministrations(
        fulfilledRequests.flatMap((request) => request.value),
      );
    },
    [currentTime, residentIds],
  );

  const loadPeriodAdministrations = useCallback(
    async (tabId) => {
      if (!periodTabIds.includes(tabId)) {
        return [];
      }

      setPeriodStatus((currentStatus) => ({
        ...currentStatus,
        [tabId]: { error: "", hasLoaded: false, isLoading: true },
      }));

      try {
        const nextAdministrations = await fetchPeriodAdministrations(tabId);

        setPeriodAdministrations((currentAdministrations) => ({
          ...currentAdministrations,
          [tabId]: nextAdministrations,
        }));
        setPeriodStatus((currentStatus) => ({
          ...currentStatus,
          [tabId]: { error: "", hasLoaded: true, isLoading: false },
        }));

        return nextAdministrations;
      } catch (error) {
        setPeriodStatus((currentStatus) => ({
          ...currentStatus,
          [tabId]: {
            error: getRequestErrorMessage(error),
            hasLoaded: true,
            isLoading: false,
          },
        }));

        return [];
      }
    },
    [fetchPeriodAdministrations],
  );

  useEffect(() => {
    if (
      activeTab === "today" ||
      isLoading ||
      activePeriodStatus.hasLoaded ||
      activePeriodStatus.isLoading
    ) {
      return;
    }

    loadPeriodAdministrations(activeTab);
  }, [
    activePeriodStatus.hasLoaded,
    activePeriodStatus.isLoading,
    activeTab,
    isLoading,
    loadPeriodAdministrations,
  ]);

  async function refreshAdministrations(preferredAdministrationId = "") {
    setIsRefreshing(true);
    setRefreshError("");

    try {
      if (activeTab !== "today") {
        const nextAdministrations = await loadPeriodAdministrations(activeTab);
        const nextSelected =
          nextAdministrations.find(
            (administration) => administration.id === preferredAdministrationId,
          ) ?? null;

        if (nextSelected) {
          setSelectedAdministrationId(nextSelected.id);
          setSelectedAdministration(nextSelected);
        }

        return nextAdministrations;
      }

      const nextAdministrations = await listTodayMedicationAdministrations();
      const sortedNextAdministrations = [...nextAdministrations].sort(
        compareByAdministrationPriority(currentTime),
      );
      const nextSelected =
        sortedNextAdministrations.find(
          (administration) => administration.id === preferredAdministrationId,
        ) ?? null;

      onAdministrationsChange?.(sortedNextAdministrations);

      if (nextSelected) {
        setSelectedAdministrationId(nextSelected.id);
        setSelectedAdministration(nextSelected);
      }

      return sortedNextAdministrations;
    } catch (error) {
      setRefreshError(getRequestErrorMessage(error));
      return sortedAdministrations;
    } finally {
      setIsRefreshing(false);
    }
  }

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setActiveFilter("all");
    setFeedback("");
    setRefreshError("");
    setSelectedAdministration(null);
    setSelectedAdministrationId("");
    setDetailStatus({ error: "", isLoading: false });
  }

  async function handleOpenDetail(administration) {
    setSelectedAdministrationId(administration.id);
    setSelectedAdministration(administration);
    setDetailStatus({ error: "", isLoading: true });

    try {
      const administrationDetail = await getMedicationAdministrationById(
        administration.id,
      );

      setSelectedAdministration(administrationDetail);
      setDetailStatus({ error: "", isLoading: false });
    } catch (error) {
      setDetailStatus({
        error: getRequestErrorMessage(error),
        isLoading: false,
      });
    }
  }

  function handleCloseDetail() {
    setSelectedAdministration(null);
    setSelectedAdministrationId("");
    setDetailStatus({ error: "", isLoading: false });
  }

  function handleOpenAction(actionType, administration) {
    if (!canRunAction(actionType, administration)) {
      return;
    }

    setActionState({
      administration,
      returnToDetail: selectedAdministration?.id === administration.id,
      type: actionType,
    });
    setActionForm(createAdministrationActionForm(actionType));
    setActionErrors({});
    setActionSubmitError("");
    setFeedback("");
  }

  function handleCloseAction() {
    setActionState(null);
    setActionErrors({});
    setActionSubmitError("");
  }

  function handleActionFormChange(event) {
    const { name, value } = event.target;

    setActionForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    setActionErrors((currentErrors) => clearFieldError(currentErrors, name));
  }

  function handleReasonSelect(reason) {
    setActionForm((currentForm) => ({
      ...currentForm,
      reason,
    }));
    setActionErrors((currentErrors) => clearFieldError(currentErrors, "reason"));
  }

  async function handleActionSubmit(event) {
    event.preventDefault();

    const validationErrors = validateAdministrationActionForm(
      actionForm,
      actionState.type,
    );

    if (Object.keys(validationErrors).length > 0) {
      setActionErrors(validationErrors);
      setActionSubmitError("Revise os campos destacados antes de salvar.");
      return;
    }

    const actionHandler = actionHandlers[actionState.type];

    setIsSubmitting(true);
    setActionSubmitError("");
    setFeedback("");

    try {
      const updatedAdministration = await actionHandler(
        actionState.administration.id,
        actionForm,
      );
      const nextAdministrations = await refreshAdministrations(
        updatedAdministration?.id ?? actionState.administration.id,
      );
      const selectedFromRefresh =
        nextAdministrations.find(
          (administration) =>
            administration.id ===
            (updatedAdministration?.id ?? actionState.administration.id),
        ) ??
        updatedAdministration ??
        actionState.administration;
      const nextSelected =
        selectedAdministration?.id === selectedFromRefresh?.id
          ? {
              ...selectedAdministration,
              ...selectedFromRefresh,
              ...updatedAdministration,
            }
          : selectedFromRefresh;

      setSelectedAdministrationId(nextSelected?.id ?? "");
      setSelectedAdministration(
        actionState.returnToDetail ? nextSelected : null,
      );
      setActionState(null);
      setActionErrors({});
      setFeedback(actionFeedback[actionState.type]);
    } catch (error) {
      setActionErrors(error?.errors ?? {});
      setActionSubmitError(getRequestErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenManualModal() {
    if (!isAdmin) {
      return;
    }

    setManualForm(createEmptyManualAdministrationForm());
    setManualErrors({});
    setManualSubmitError("");
    setFeedback("");
    setIsManualModalOpen(true);
  }

  function handleCloseManualModal() {
    setIsManualModalOpen(false);
    setManualErrors({});
    setManualSubmitError("");
  }

  function handleManualFormChange(event) {
    const { name, value } = event.target;

    setManualForm((currentForm) => ({
      ...currentForm,
      [name]: value,
      ...(name === "residentId" ? { prescriptionId: "" } : {}),
    }));
    setManualErrors((currentErrors) => clearFieldError(currentErrors, name));
  }

  async function handleManualSubmit(event) {
    event.preventDefault();

    const validationErrors = validateManualAdministrationForm(manualForm);

    if (Object.keys(validationErrors).length > 0) {
      setManualErrors(validationErrors);
      setManualSubmitError("Revise os campos destacados antes de salvar.");
      return;
    }

    setIsSubmitting(true);
    setManualSubmitError("");
    setFeedback("");

    try {
      const createdAdministration = await createManualMedicationAdministration(
        manualForm,
      );

      await refreshAdministrations(createdAdministration?.id);
      setIsManualModalOpen(false);
      setManualErrors({});
      setFeedback("Administração manual criada com sucesso.");
    } catch (error) {
      setManualErrors(error?.errors ?? {});
      setManualSubmitError(getRequestErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function canRunAction(actionType, administration) {
    if (!isPendingAdministration(administration)) {
      return false;
    }

    return actionType !== "cancel" || isAdmin;
  }

  return (
    <>
      <section className="dashboard-hero administrations-hero">
        <div className="dashboard-hero-copy">
          <span className="overline">Administração</span>
          <h2>Agenda de medicamentos</h2>
          <p>{activeTabContent.heroDescription}</p>
        </div>

        <div
          className="dashboard-hero-status"
          aria-label="Resumo de administrações"
        >
          <span className="dashboard-company-status is-active">
            {activeTabContent.periodLabel}
          </span>
          <strong>{stats.pending} pendentes</strong>
          <span>{activeTabContent.secondarySummary(stats)}</span>
        </div>
      </section>

      <section
        className="administration-tabs"
        aria-label="Período"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            aria-selected={activeTab === tab.id}
            className={`administration-tab${
              activeTab === tab.id ? " is-active" : ""
            }`}
            key={tab.id}
            role="tab"
            type="button"
            onClick={() => handleTabChange(tab.id)}
          >
            <span>{tab.label}</span>
            <strong>{tab.countLabel}</strong>
          </button>
        ))}
      </section>

      <section
        className="dashboard-overview-grid"
        aria-label="Resumo de administrações"
      >
        <MetricCard
          label={activeTabContent.totalLabel}
          value={stats.total}
          detail={`${filteredAdministrations.length} ${activeTabContent.totalDetail}`}
          loading={isBusy}
        />
        <MetricCard
          label="Pendentes"
          value={stats.pending}
          detail="aguardando registro"
          loading={isBusy}
        />
        <MetricCard
          label="Atrasadas"
          value={stats.late}
          detail="pendentes com horário vencido"
          loading={isBusy}
          tone={stats.late > 0 ? "danger" : "success"}
        />
        <MetricCard
          label="Administradas"
          value={stats.administered}
          detail={activeTabContent.administeredDetail}
          loading={isBusy}
          tone="success"
        />
      </section>

      <section className="dashboard-panel administrations-list-panel">
        <div className="dashboard-toolbar administrations-toolbar">
          <div className="dashboard-filter-group" aria-label="Filtros">
            {administrationFilters.map((filter) => {
              const count = filterCounts[filter.id] ?? 0;

              return (
                <button
                  aria-label={`${filter.label}: ${count}`}
                  className={`dashboard-filter-button administration-filter-button${
                    activeFilter === filter.id ? " is-active" : ""
                  }`}
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                >
                  <span className="administration-filter-label">
                    {filter.label}
                  </span>
                  <span className="administration-filter-count">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="administrations-toolbar-actions">
            <button
              className="dashboard-button dashboard-button-muted"
              disabled={isBusy}
              type="button"
              onClick={() => refreshAdministrations()}
            >
              Atualizar
            </button>
            {isAdmin ? (
              <button
                className="dashboard-button dashboard-button-primary"
                disabled={isSubmitting}
                type="button"
                onClick={handleOpenManualModal}
              >
                Dose avulsa
              </button>
            ) : null}
          </div>
        </div>

        <PanelHeader
          overline={activeTabContent.periodLabel}
          title={activeTabContent.panelTitle}
          action={`${filteredAdministrations.length} em ${activeFilterLabel}`}
        />

        {feedback ? (
          <div
            className="dashboard-form-alert dashboard-form-alert-success"
            role="status"
          >
            {feedback}
          </div>
        ) : null}

        {activeError ? (
          <div
            className="dashboard-form-alert dashboard-form-alert-danger"
            role="status"
          >
            {activeError}
          </div>
        ) : null}

        {isBusy ? (
          <LoadingRows />
        ) : filteredAdministrations.length > 0 ? (
          <div className="administration-directory">
            {filteredAdministrations.map((administration) => (
              <AdministrationRow
                administration={administration}
                currentTime={currentTime}
                isMutating={isSubmitting}
                isSelected={selectedAdministrationId === administration.id}
                key={administration.id}
                onAction={handleOpenAction}
                onOpenDetail={handleOpenDetail}
              />
            ))}
          </div>
        ) : (
          <EmptyState title={activeTabContent.emptyTitle} />
        )}
      </section>

      {selectedAdministration && !actionState ? (
        <AdministrationDetailModal
          administration={selectedAdministration}
          currentTime={currentTime}
          detailStatus={detailStatus}
          isAdmin={isAdmin}
          isMutating={isSubmitting}
          onAction={handleOpenAction}
          onClose={handleCloseDetail}
        />
      ) : null}

      {actionState ? (
        <AdministrationActionModal
          actionType={actionState.type}
          administration={actionState.administration}
          errors={actionErrors}
          form={actionForm}
          isSubmitting={isSubmitting}
          submitError={actionSubmitError}
          onChange={handleActionFormChange}
          onClose={handleCloseAction}
          onReasonSelect={handleReasonSelect}
          onSubmit={handleActionSubmit}
        />
      ) : null}

      {isManualModalOpen ? (
        <ManualAdministrationModal
          errors={manualErrors}
          form={manualForm}
          isSubmitting={isSubmitting}
          prescriptions={prescriptions}
          residents={residents}
          submitError={manualSubmitError}
          onChange={handleManualFormChange}
          onClose={handleCloseManualModal}
          onSubmit={handleManualSubmit}
        />
      ) : null}
    </>
  );
}

function buildAdministrationPeriodFilters(tabId, currentTime) {
  const todayStart = startOfDay(new Date(currentTime || Date.now()));

  if (tabId === "future") {
    const startDate = addDays(todayStart, 1);
    const endDate = addDays(startDate, periodWindowDays);
    endDate.setMilliseconds(-1);

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }

  const endDate = new Date(todayStart);
  endDate.setMilliseconds(-1);

  return {
    startDate: addDays(todayStart, -periodWindowDays).toISOString(),
    endDate: endDate.toISOString(),
  };
}

function startOfDay(date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);

  return nextDate;
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function getUniqueResidentIds({ administrations, prescriptions, residents }) {
  const residentIds = new Set();

  residents.forEach((resident) => {
    addResidentId(residentIds, resident.id);
  });
  prescriptions.forEach((prescription) => {
    addResidentId(residentIds, prescription.residentId);
    addResidentId(residentIds, prescription.resident?.id);
  });
  administrations.forEach((administration) => {
    addResidentId(residentIds, administration.residentId);
    addResidentId(residentIds, administration.resident?.id);
  });

  return Array.from(residentIds);
}

function addResidentId(residentIds, residentId) {
  if (residentId) {
    residentIds.add(residentId);
  }
}

function getUniqueAdministrations(administrations) {
  const administrationsById = new Map();

  administrations.forEach((administration) => {
    if (administration?.id) {
      administrationsById.set(administration.id, administration);
    }
  });

  return Array.from(administrationsById.values());
}
