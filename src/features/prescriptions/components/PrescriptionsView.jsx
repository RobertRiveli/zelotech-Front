import { useEffect, useMemo, useState } from "react";
import { listMeasurementUnits } from "@/features/measurement-units/api/measurementUnitService";
import {
  createPrescription,
  deactivatePrescription,
  getPrescriptionById,
  listPrescriptions,
  updatePrescription,
} from "@/features/prescriptions/api/prescriptionService";
import {
  clearFieldError,
  getRequestErrorMessage,
} from "@/shared/utils/formErrors";
import { compareByStartDate } from "@/features/prescriptions/utils/prescriptionSorters";
import {
  buildPrescriptionStats,
  filterPrescriptions,
  prescriptionFilters,
} from "@/features/prescriptions/utils/prescriptionDashboardUtils";
import {
  createEmptyPrescriptionForm,
  createPrescriptionFormFromPrescription,
} from "@/features/prescriptions/utils/prescriptionForm";
import { validatePrescriptionForm } from "@/features/prescriptions/validations/prescriptionSchema";
import { LoadingRows } from "@/shared/ui/LoadingRows";
import { MetricCard } from "@/shared/ui/MetricCard";
import { PanelHeader } from "@/shared/ui/PanelHeader";
import { PrescriptionDeactivateModal } from "./PrescriptionDeactivateModal";
import { PrescriptionDetailPanel } from "./PrescriptionDetailPanel";
import { PrescriptionFormModal } from "./PrescriptionFormModal";
import { PrescriptionRow } from "./PrescriptionRow";
import "./PrescriptionsView.css";

const fieldErrorAliases = {
  medicationId: ["medication"],
  measurementUnitId: ["measurementUnit"],
  firstScheduledDate: ["firstScheduledAt"],
  firstScheduledTime: ["firstScheduledAt"],
  residentId: ["resident"],
};

export function PrescriptionsView({
  currentTime,
  isLoading,
  medications,
  onPrescriptionsChange,
  onSearchChange,
  prescriptions,
  residents,
  searchTerm,
}) {
  const [measurementUnits, setMeasurementUnits] = useState([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);
  const [unitsError, setUnitsError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [localSearch, setLocalSearch] = useState("");
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [detailStatus, setDetailStatus] = useState({
    error: "",
    isLoading: false,
  });
  const [formMode, setFormMode] = useState("");
  const [form, setForm] = useState(() => createEmptyPrescriptionForm());
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [prescriptionToDeactivate, setPrescriptionToDeactivate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const globalSearchTerm = searchTerm ?? "";

  useEffect(() => {
    let isMounted = true;

    async function loadUnits() {
      setIsLoadingUnits(true);
      setUnitsError("");

      try {
        const units = await listMeasurementUnits();

        if (isMounted) {
          setMeasurementUnits(units);
        }
      } catch (error) {
        if (isMounted) {
          setUnitsError(getRequestErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsLoadingUnits(false);
        }
      }
    }

    loadUnits();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedPrescriptions = useMemo(
    () => [...prescriptions].sort(compareByStartDate),
    [prescriptions],
  );
  const stats = useMemo(
    () => buildPrescriptionStats(sortedPrescriptions, currentTime),
    [currentTime, sortedPrescriptions],
  );
  const filteredByLocalControls = useMemo(
    () =>
      filterPrescriptions(sortedPrescriptions, {
        currentTime,
        filterId: activeFilter,
        searchTerm: localSearch,
      }),
    [activeFilter, currentTime, localSearch, sortedPrescriptions],
  );
  const filteredPrescriptions = useMemo(
    () =>
      globalSearchTerm
        ? filterPrescriptions(filteredByLocalControls, {
            currentTime,
            filterId: "all",
            searchTerm: globalSearchTerm,
          })
        : filteredByLocalControls,
    [currentTime, filteredByLocalControls, globalSearchTerm],
  );

  const selectedFromList = selectedPrescriptionId
    ? filteredPrescriptions.find(
        (prescription) => prescription.id === selectedPrescriptionId,
      ) ?? null
    : null;
  const visibleSelectedPrescription =
    selectedPrescription?.id === selectedFromList?.id
      ? selectedPrescription
      : selectedFromList;
  const visibleSelectedPrescriptionId = selectedFromList?.id ?? "";

  async function refreshPrescriptions(preferredPrescriptionId) {
    setIsRefreshing(true);

    try {
      const nextPrescriptions = await listPrescriptions();
      const sortedNextPrescriptions = [...nextPrescriptions].sort(compareByStartDate);
      const nextSelected = preferredPrescriptionId
        ? sortedNextPrescriptions.find(
            (prescription) => prescription.id === preferredPrescriptionId,
          ) ?? null
        : null;

      onPrescriptionsChange?.(sortedNextPrescriptions);
      setSelectedPrescriptionId(nextSelected?.id ?? "");
      setSelectedPrescription(nextSelected);

      return sortedNextPrescriptions;
    } finally {
      setIsRefreshing(false);
    }
  }

  async function loadPrescriptionDetail(prescription) {
    setDetailStatus({ error: "", isLoading: true });

    try {
      const prescriptionDetail = await getPrescriptionById(prescription.id);

      setSelectedPrescription(prescriptionDetail);
      setDetailStatus({ error: "", isLoading: false });
    } catch (error) {
      setDetailStatus({
        error: getRequestErrorMessage(error),
        isLoading: false,
      });
    }
  }

  function handleStartCreate() {
    setFormMode("create");
    setForm(createEmptyPrescriptionForm());
    setFormErrors({});
    setSubmitError("");
    setFeedback("");
  }

  function handleSelectPrescription(prescription) {
    setFormMode("");
    setSelectedPrescriptionId(prescription.id);
    setSelectedPrescription(prescription);
    setSubmitError("");
    setFormErrors({});
    loadPrescriptionDetail(prescription);
  }

  function handleEdit(prescription = visibleSelectedPrescription) {
    if (!prescription) {
      return;
    }

    setFormMode("edit");
    setSelectedPrescriptionId(prescription.id);
    setSelectedPrescription(prescription);
    setForm(createPrescriptionFormFromPrescription(prescription));
    setFormErrors({});
    setSubmitError("");
    setFeedback("");
  }

  function handleCancelForm() {
    setFormMode("");
    setFormErrors({});
    setSubmitError("");
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    setFormErrors((currentErrors) =>
      clearFieldError(currentErrors, name, fieldErrorAliases),
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationErrors = validatePrescriptionForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setSubmitError("Revise os campos destacados antes de salvar.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setFeedback("");

    try {
      if (formMode === "edit") {
        const updatedPrescription = await updatePrescription(
          selectedPrescriptionId,
          form,
        );

        await refreshPrescriptions(updatedPrescription?.id ?? selectedPrescriptionId);
        setFeedback("Prescrição atualizada com sucesso.");
      } else {
        const result = await createPrescription(form);
        const createdPrescription = result?.prescription;
        const generatedCount = result?.generatedAdministrations?.count;

        await refreshPrescriptions(createdPrescription?.id);
        setFeedback(
          generatedCount
            ? `Prescrição criada com sucesso. ${generatedCount} administrações geradas.`
            : "Prescrição criada com sucesso.",
        );
      }

      setFormMode("");
      setFormErrors({});
    } catch (error) {
      setFormErrors(error?.errors ?? {});
      setSubmitError(getRequestErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDeactivate(prescription = visibleSelectedPrescription) {
    if (!prescription) {
      return;
    }

    setFormMode("");
    setPrescriptionToDeactivate(prescription);
    setFeedback("");
  }

  async function handleConfirmDeactivate() {
    if (!prescriptionToDeactivate) {
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      await deactivatePrescription(prescriptionToDeactivate.id);
      await refreshPrescriptions("");
      setFormMode("");
      setPrescriptionToDeactivate(null);
      setFeedback("Prescrição desativada com sucesso.");
    } catch (error) {
      setPrescriptionToDeactivate(null);
      setDetailStatus({
        error: getRequestErrorMessage(error),
        isLoading: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isBusy = isLoading || isRefreshing;
  const activeFilterLabel =
    prescriptionFilters.find((filter) => filter.id === activeFilter)?.label ??
    "Todas";
  const hasActiveFilters =
    Boolean(localSearch.trim()) ||
    Boolean(globalSearchTerm.trim()) ||
    activeFilter !== "all";
  const filterCounts = {
    all: stats.active,
    ending: stats.endingSoon,
    open: stats.withoutEndDate,
    today: stats.firstScheduledToday,
  };

  function handleClearFilters() {
    setActiveFilter("all");
    setLocalSearch("");
    onSearchChange?.("");
  }

  function renderEmptyState() {
    return (
      <div className="prescription-empty-state">
        <strong>
          {hasActiveFilters
            ? "Nenhuma prescrição encontrada."
            : "Nenhuma prescrição cadastrada."}
        </strong>
        <span>
          {hasActiveFilters
            ? "Ajuste a busca ou os filtros para ampliar a listagem."
            : "Cadastre uma prescrição para gerar a agenda medicamentosa."}
        </span>
        <div className="prescription-empty-actions">
          {hasActiveFilters ? (
            <button
              className="dashboard-button dashboard-button-muted"
              type="button"
              onClick={handleClearFilters}
            >
              Limpar filtros
            </button>
          ) : null}
          <button
            className="dashboard-button dashboard-button-primary"
            type="button"
            onClick={handleStartCreate}
          >
            Nova prescrição
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <section
        className="dashboard-overview-grid"
        aria-label="Resumo de prescrições"
      >
        <MetricCard
          label="Prescrições ativas"
          value={stats.active}
          detail={`${filteredPrescriptions.length} visíveis na busca`}
          loading={isLoading}
        />
        <MetricCard
          label="Encerrando em breve"
          value={stats.endingSoon}
          detail="nos próximos 7 dias"
          loading={isLoading}
          tone={stats.endingSoon > 0 ? "danger" : "success"}
        />
        <MetricCard
          label="Sem data final"
          value={stats.withoutEndDate}
          detail="geram janela inicial de 7 dias"
          loading={isLoading}
        />
        <MetricCard
          label="Primeiro horário hoje"
          value={stats.firstScheduledToday}
          detail="novas agendas previstas"
          loading={isLoading}
        />
      </section>

      <section className="dashboard-two-column-layout prescriptions-operational-layout">
        <section className="dashboard-panel prescriptions-list-panel">
          <div className="prescriptions-list-heading">
            <PanelHeader
              overline="Lista"
              title="Prescrições ativas"
              action={`${filteredPrescriptions.length} em ${activeFilterLabel}`}
            />

            <button
              className="dashboard-button dashboard-button-primary"
              type="button"
              onClick={handleStartCreate}
            >
              Nova prescrição
            </button>
          </div>

          <div className="prescriptions-toolbar">
            <label
              className="prescriptions-search-field"
              htmlFor="prescriptions-search"
            >
              <span className="sr-only">
                Buscar por residente, medicamento, via ou prescritor
              </span>
              <input
                id="prescriptions-search"
                placeholder="Buscar por residente, medicamento, via ou prescritor"
                value={localSearch}
                onChange={(event) => setLocalSearch(event.target.value)}
              />
            </label>

            <div
              aria-label="Filtrar prescrições por status"
              className="dashboard-filter-group prescription-filter-group"
            >
              {prescriptionFilters.map((filter) => (
                <button
                  aria-pressed={activeFilter === filter.id}
                  className={`dashboard-filter-button prescription-filter-button${
                    activeFilter === filter.id ? " is-active" : ""
                  }`}
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                >
                  <span className="prescription-filter-label">{filter.label}</span>
                  <span className="prescription-filter-count">
                    {filterCounts[filter.id] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {isBusy ? (
            <LoadingRows />
          ) : filteredPrescriptions.length > 0 ? (
            <div className="prescription-table-wrap">
              <table className="prescription-table">
                <caption className="sr-only">
                  Listagem operacional de prescrições
                </caption>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Residente</th>
                    <th>Medicamento</th>
                    <th>Dose e frequência</th>
                    <th>Período</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrescriptions.map((prescription) => (
                    <PrescriptionRow
                      currentTime={currentTime}
                      isMutating={isSubmitting}
                      isSelected={
                        visibleSelectedPrescriptionId === prescription.id
                      }
                      key={prescription.id}
                      prescription={prescription}
                      onDeactivate={handleDeactivate}
                      onEdit={handleEdit}
                      onSelect={handleSelectPrescription}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            renderEmptyState()
          )}
        </section>

        <section className="dashboard-panel prescriptions-detail-panel">
          <PrescriptionDetailPanel
            currentTime={currentTime}
            detailStatus={detailStatus}
            isMutating={isSubmitting}
            prescription={visibleSelectedPrescription}
            onDeactivate={() => handleDeactivate(visibleSelectedPrescription)}
            onEdit={() => handleEdit(visibleSelectedPrescription)}
          />
        </section>
      </section>

      {formMode ? (
        <PrescriptionFormModal
          errors={formErrors}
          form={form}
          isLoadingAuxiliaryData={isLoadingUnits}
          isSubmitting={isSubmitting}
          medications={medications}
          mode={formMode}
          residents={residents}
          submitError={submitError}
          units={measurementUnits}
          unitsError={unitsError}
          onChange={handleFormChange}
          onClose={handleCancelForm}
          onSubmit={handleSubmit}
        />
      ) : null}

      {prescriptionToDeactivate ? (
        <PrescriptionDeactivateModal
          isMutating={isSubmitting}
          prescription={prescriptionToDeactivate}
          onClose={() => setPrescriptionToDeactivate(null)}
          onConfirm={handleConfirmDeactivate}
        />
      ) : null}

      {feedback ? (
        <div className="prescription-toast" role="status">
          <span>{feedback}</span>
          <button
            aria-label="Fechar feedback"
            type="button"
            onClick={() => setFeedback("")}
          >
            x
          </button>
        </div>
      ) : null}
    </>
  );
}
