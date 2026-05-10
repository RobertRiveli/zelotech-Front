import { useMemo, useState } from "react";
import {
  administerMedicationAdministration,
  cancelMedicationAdministration,
  createManualMedicationAdministration,
  getMedicationAdministrationById,
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
import { compareByAdministrationPriority } from "@/features/medication-administrations/utils/administrationSorters";
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
  const [activeFilter, setActiveFilter] = useState("all");
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

  const sortedAdministrations = useMemo(
    () => [...administrations].sort(compareByAdministrationPriority(currentTime)),
    [administrations, currentTime],
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
  const isBusy = isLoading || isRefreshing;

  async function refreshAdministrations(preferredAdministrationId = "") {
    setIsRefreshing(true);
    setRefreshError("");

    try {
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
          <h2>Agenda diária de medicamentos</h2>
          <p>
            Acompanhe as administrações previstas para hoje, priorize atrasos e
            registre o desfecho operacional de cada dose.
          </p>
        </div>

        <div
          className="dashboard-hero-status"
          aria-label="Resumo de administrações"
        >
          <span className="dashboard-company-status is-active">Hoje</span>
          <strong>{stats.pending} pendentes</strong>
          <span>{stats.late} atrasadas</span>
        </div>
      </section>

      <section
        className="dashboard-overview-grid"
        aria-label="Resumo de administrações"
      >
        <MetricCard
          label="Total do dia"
          value={stats.total}
          detail={`${filteredAdministrations.length} visíveis no filtro`}
          loading={isLoading}
        />
        <MetricCard
          label="Pendentes"
          value={stats.pending}
          detail="aguardando registro"
          loading={isLoading}
        />
        <MetricCard
          label="Atrasadas"
          value={stats.late}
          detail="pendentes com horário vencido"
          loading={isLoading}
          tone={stats.late > 0 ? "danger" : "success"}
        />
        <MetricCard
          label="Administradas"
          value={stats.administered}
          detail="concluídas hoje"
          loading={isLoading}
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
          overline="Agenda"
          title="Administrações de hoje"
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

        {refreshError ? (
          <div
            className="dashboard-form-alert dashboard-form-alert-danger"
            role="status"
          >
            {refreshError}
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
          <EmptyState title="Nenhuma administração encontrada para o filtro atual." />
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
