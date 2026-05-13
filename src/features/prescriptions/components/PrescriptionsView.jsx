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
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingRows } from "@/shared/ui/LoadingRows";
import { MetricCard } from "@/shared/ui/MetricCard";
import { PanelHeader } from "@/shared/ui/PanelHeader";
import { PrescriptionDeactivateModal } from "./PrescriptionDeactivateModal";
import { PrescriptionDetailPanel } from "./PrescriptionDetailPanel";
import { PrescriptionForm } from "./PrescriptionForm";
import { PrescriptionRow } from "./PrescriptionRow";
import "./PrescriptionsView.css";

const fieldErrorAliases = {
  firstScheduledDate: ["firstScheduledAt"],
  firstScheduledTime: ["firstScheduledAt"],
};

export function PrescriptionsView({
  currentTime,
  isLoading,
  medications,
  onPrescriptionsChange,
  prescriptions,
  residents,
  searchTerm,
}) {
  const [measurementUnits, setMeasurementUnits] = useState([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);
  const [unitsError, setUnitsError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [detailStatus, setDetailStatus] = useState({
    error: "",
    isLoading: false,
  });
  const [mode, setMode] = useState("detail");
  const [form, setForm] = useState(() => createEmptyPrescriptionForm());
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [prescriptionToDeactivate, setPrescriptionToDeactivate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const filteredPrescriptions = useMemo(
    () =>
      filterPrescriptions(sortedPrescriptions, {
        currentTime,
        filterId: activeFilter,
        searchTerm,
      }),
    [activeFilter, currentTime, searchTerm, sortedPrescriptions],
  );

  const selectedFromList =
    filteredPrescriptions.find(
      (prescription) => prescription.id === selectedPrescriptionId,
    ) ??
    filteredPrescriptions[0] ??
    null;
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
      const nextSelected =
        sortedNextPrescriptions.find(
          (prescription) => prescription.id === preferredPrescriptionId,
        ) ?? sortedNextPrescriptions[0] ?? null;

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
    setMode("create");
    setForm(createEmptyPrescriptionForm());
    setFormErrors({});
    setSubmitError("");
    setFeedback("");
  }

  function handleSelectPrescription(prescription) {
    setMode("detail");
    setSelectedPrescriptionId(prescription.id);
    setSelectedPrescription(prescription);
    setSubmitError("");
    setFormErrors({});
    loadPrescriptionDetail(prescription);
  }

  function handleEdit() {
    if (!visibleSelectedPrescription) {
      return;
    }

    setMode("edit");
    setSelectedPrescriptionId(visibleSelectedPrescription.id);
    setSelectedPrescription(visibleSelectedPrescription);
    setForm(createPrescriptionFormFromPrescription(visibleSelectedPrescription));
    setFormErrors({});
    setSubmitError("");
    setFeedback("");
  }

  function handleCancelForm() {
    setMode("detail");
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
      if (mode === "edit") {
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

      setMode("detail");
      setFormErrors({});
    } catch (error) {
      setFormErrors(error?.errors ?? {});
      setSubmitError(getRequestErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivate() {
    if (!visibleSelectedPrescription) {
      return;
    }

    setPrescriptionToDeactivate(visibleSelectedPrescription);
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
      setMode("detail");
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
  const filterCounts = {
    all: stats.active,
    ending: stats.endingSoon,
    open: stats.withoutEndDate,
    today: stats.firstScheduledToday,
  };

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

      <section className="dashboard-two-column-layout">
        <section className="dashboard-panel prescriptions-list-panel">
          <div className="dashboard-toolbar">
            <div className="dashboard-filter-group" aria-label="Filtros">
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

            <button
              className="dashboard-button dashboard-button-primary"
              type="button"
              onClick={handleStartCreate}
            >
              Nova prescrição
            </button>
          </div>

          <PanelHeader
            overline="Lista"
            title="Prescrições ativas"
            action={`${filteredPrescriptions.length} em ${activeFilterLabel}`}
          />

          {feedback ? (
            <div
              className="dashboard-form-alert dashboard-form-alert-success"
              role="status"
            >
              {feedback}
            </div>
          ) : null}

          {isBusy ? (
            <LoadingRows />
          ) : filteredPrescriptions.length > 0 ? (
            <div className="prescription-directory">
              <div className="prescription-directory-header" aria-hidden="true">
                <span>Status</span>
                <span>Residente e medicamento</span>
                <span>Dose e frequência</span>
              </div>

              {filteredPrescriptions.map((prescription) => (
                <PrescriptionRow
                  currentTime={currentTime}
                  isSelected={visibleSelectedPrescriptionId === prescription.id}
                  key={prescription.id}
                  prescription={prescription}
                  onSelect={handleSelectPrescription}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="Nenhuma prescrição encontrada para o filtro atual." />
          )}
        </section>

        <section className="dashboard-panel prescriptions-detail-panel">
          {mode === "create" || mode === "edit" ? (
            <>
              <PanelHeader
                overline={mode === "edit" ? "Edição" : "Cadastro"}
                title={mode === "edit" ? "Editar prescrição" : "Nova prescrição"}
                action={mode === "edit" ? "Editando" : "Criando"}
              />

              {unitsError ? (
                <div className="resident-inline-alert" role="status">
                  {unitsError}
                </div>
              ) : null}

              <PrescriptionForm
                errors={formErrors}
                form={form}
                isLoadingAuxiliaryData={isLoadingUnits}
                isSubmitting={isSubmitting}
                medications={medications}
                mode={mode}
                residents={residents}
                submitError={submitError}
                units={measurementUnits}
                onCancel={handleCancelForm}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
              />
            </>
          ) : (
            <PrescriptionDetailPanel
              currentTime={currentTime}
              detailStatus={detailStatus}
              isMutating={isSubmitting}
              prescription={visibleSelectedPrescription}
              onDeactivate={handleDeactivate}
              onEdit={handleEdit}
            />
          )}
        </section>
      </section>

      {prescriptionToDeactivate ? (
        <PrescriptionDeactivateModal
          isMutating={isSubmitting}
          prescription={prescriptionToDeactivate}
          onClose={() => setPrescriptionToDeactivate(null)}
          onConfirm={handleConfirmDeactivate}
        />
      ) : null}
    </>
  );
}
