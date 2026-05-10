import { useMemo, useState } from "react";
import {
  createMedication,
  deleteMedication,
  getMedicationById,
  listMedications,
  updateMedication,
} from "@/features/medications/api/medicationService";
import {
  buildMedicationFormFilters,
  buildMedicationStats,
  filterMedications,
  findDuplicateMedication,
} from "@/features/medications/utils/medicationDashboardUtils";
import {
  createEmptyMedicationForm,
  createMedicationFormFromMedication,
} from "@/features/medications/utils/medicationForm";
import { compareByGenericName } from "@/features/medications/utils/medicationSorters";
import { getMedicationName } from "@/features/medications/utils/medicationFormatters";
import { validateMedicationForm } from "@/features/medications/validations/medicationSchema";
import {
  clearFieldError,
  getRequestErrorMessage,
} from "@/shared/utils/formErrors";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingRows } from "@/shared/ui/LoadingRows";
import { MetricCard } from "@/shared/ui/MetricCard";
import { PanelHeader } from "@/shared/ui/PanelHeader";
import { MedicationDetailPanel } from "./MedicationDetailPanel";
import { MedicationForm } from "./MedicationForm";
import { MedicationRow } from "./MedicationRow";
import "./MedicationsView.css";

export function MedicationsView({
  isAdmin,
  isLoading,
  medications,
  onMedicationsChange,
  searchTerm,
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedMedicationId, setSelectedMedicationId] = useState("");
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [detailStatus, setDetailStatus] = useState({
    error: "",
    isLoading: false,
  });
  const [mode, setMode] = useState("detail");
  const [form, setForm] = useState(() => createEmptyMedicationForm());
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedMedications = useMemo(
    () => [...medications].sort(compareByGenericName),
    [medications],
  );
  const stats = useMemo(
    () => buildMedicationStats(sortedMedications),
    [sortedMedications],
  );
  const formFilters = useMemo(
    () => buildMedicationFormFilters(sortedMedications),
    [sortedMedications],
  );
  const visibleFilter = formFilters.some((filter) => filter.id === activeFilter)
    ? activeFilter
    : "all";
  const filteredMedications = useMemo(
    () =>
      filterMedications(sortedMedications, {
        filterId: visibleFilter,
        searchTerm,
      }),
    [searchTerm, sortedMedications, visibleFilter],
  );

  const selectedFromList =
    filteredMedications.find(
      (medication) => medication.id === selectedMedicationId,
    ) ??
    filteredMedications[0] ??
    null;
  const visibleSelectedMedication =
    selectedMedication?.id === selectedFromList?.id
      ? selectedMedication
      : selectedFromList;
  const visibleSelectedMedicationId = selectedFromList?.id ?? "";
  const isBusy = isLoading || isRefreshing;
  const activeFilterLabel =
    formFilters.find((filter) => filter.id === visibleFilter)?.label ?? "Todas";

  async function refreshMedications(preferredMedicationId) {
    setIsRefreshing(true);

    try {
      const nextMedications = await listMedications();
      const sortedNextMedications = [...nextMedications].sort(
        compareByGenericName,
      );
      const nextSelected =
        sortedNextMedications.find(
          (medication) => medication.id === preferredMedicationId,
        ) ??
        sortedNextMedications[0] ??
        null;

      onMedicationsChange?.(sortedNextMedications);
      setSelectedMedicationId(nextSelected?.id ?? "");
      setSelectedMedication(nextSelected);

      return sortedNextMedications;
    } finally {
      setIsRefreshing(false);
    }
  }

  async function loadMedicationDetail(medication) {
    setDetailStatus({ error: "", isLoading: true });

    try {
      const medicationDetail = await getMedicationById(medication.id);

      setSelectedMedication(medicationDetail);
      setDetailStatus({ error: "", isLoading: false });
    } catch (error) {
      setDetailStatus({
        error: getRequestErrorMessage(error),
        isLoading: false,
      });
    }
  }

  function handleStartCreate() {
    if (!isAdmin) {
      return;
    }

    setMode("create");
    setForm(createEmptyMedicationForm());
    setFormErrors({});
    setSubmitError("");
    setFeedback("");
  }

  function handleSelectMedication(medication) {
    setMode("detail");
    setSelectedMedicationId(medication.id);
    setSelectedMedication(medication);
    setSubmitError("");
    setFormErrors({});
    loadMedicationDetail(medication);
  }

  function handleEdit() {
    if (!isAdmin || !visibleSelectedMedication) {
      return;
    }

    setMode("edit");
    setSelectedMedicationId(visibleSelectedMedication.id);
    setSelectedMedication(visibleSelectedMedication);
    setForm(createMedicationFormFromMedication(visibleSelectedMedication));
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
    setFormErrors((currentErrors) => clearFieldError(currentErrors, name));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateMedicationForm(form);
    const duplicateMedication = findDuplicateMedication(
      sortedMedications,
      form,
      mode === "edit" ? selectedMedicationId : "",
    );

    if (duplicateMedication) {
      validationErrors.medication =
        "Medicamento já cadastrado com o mesmo nome, forma e dosagem.";
    }

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
        const updatedMedication = await updateMedication(
          selectedMedicationId,
          form,
        );

        await refreshMedications(updatedMedication?.id ?? selectedMedicationId);
        setFeedback("Medicamento atualizado com sucesso.");
      } else {
        const createdMedication = await createMedication(form);

        setActiveFilter("all");
        await refreshMedications(createdMedication?.id);
        setFeedback("Medicamento cadastrado com sucesso.");
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

  async function handleDelete() {
    if (!isAdmin || !visibleSelectedMedication) {
      return;
    }

    const confirmed = window.confirm(
      `Excluir ${getMedicationName(visibleSelectedMedication)} do catálogo?`,
    );

    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      await deleteMedication(visibleSelectedMedication.id);
      await refreshMedications("");
      setMode("detail");
      setFeedback("Medicamento deletado com sucesso.");
    } catch (error) {
      setDetailStatus({
        error: getRequestErrorMessage(error),
        isLoading: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section className="dashboard-hero medications-hero">
        <div className="dashboard-hero-copy">
          <span className="overline">Medicamentos</span>
          <h2>Catálogo ativo de medicamentos</h2>
          <p>
            Cadastre e mantenha os medicamentos disponíveis para uso nas
            prescrições da instituição.
          </p>
        </div>
      </section>

      <section
        className="dashboard-overview-grid medications-overview-grid"
        aria-label="Resumo de medicamentos"
      >
        <MetricCard
          label="Medicamentos ativos"
          value={stats.active}
          detail="cadastro ativo da empresa"
          loading={isLoading}
        />
      </section>

      <section className="dashboard-two-column-layout">
        <section className="dashboard-panel medications-list-panel">
          <div className="dashboard-toolbar">
            <div className="dashboard-filter-group" aria-label="Filtros">
              {formFilters.map((filter) => (
                <button
                  className={`dashboard-filter-button${
                    visibleFilter === filter.id ? " is-active" : ""
                  }`}
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {isAdmin ? (
              <button
                className="dashboard-button dashboard-button-primary"
                type="button"
                onClick={handleStartCreate}
              >
                Novo medicamento
              </button>
            ) : null}
          </div>

          <PanelHeader
            overline="Lista"
            title="Medicamentos ativos"
            action={`${filteredMedications.length} em ${activeFilterLabel}`}
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
          ) : filteredMedications.length > 0 ? (
            <div className="medication-directory">
              {filteredMedications.map((medication) => (
                <MedicationRow
                  isSelected={visibleSelectedMedicationId === medication.id}
                  key={medication.id}
                  medication={medication}
                  onSelect={handleSelectMedication}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="Nenhum medicamento encontrado para o filtro atual." />
          )}
        </section>

        <section className="dashboard-panel medications-detail-panel">
          {mode === "create" || mode === "edit" ? (
            <>
              <PanelHeader
                overline={mode === "edit" ? "Edição" : "Cadastro"}
                title={
                  mode === "edit" ? "Editar medicamento" : "Novo medicamento"
                }
              />

              <MedicationForm
                errors={formErrors}
                form={form}
                isSubmitting={isSubmitting}
                submitError={submitError}
                onCancel={handleCancelForm}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
              />
            </>
          ) : (
            <MedicationDetailPanel
              detailStatus={detailStatus}
              isAdmin={isAdmin}
              isMutating={isSubmitting}
              medication={visibleSelectedMedication}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
        </section>
      </section>
    </>
  );
}
