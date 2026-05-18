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
  filterMedications,
  findDuplicateMedication,
} from "@/features/medications/utils/medicationDashboardUtils";
import {
  createEmptyMedicationForm,
  createMedicationFormFromMedication,
} from "@/features/medications/utils/medicationForm";
import { compareByGenericName } from "@/features/medications/utils/medicationSorters";
import {
  clearFieldError,
  getRequestErrorMessage,
} from "@/shared/utils/formErrors";
import { LoadingRows } from "@/shared/ui/LoadingRows";
import { PanelHeader } from "@/shared/ui/PanelHeader";
import { MedicationDeleteModal } from "./MedicationDeleteModal";
import { MedicationDetailPanel } from "./MedicationDetailPanel";
import { MedicationFormModal } from "./MedicationFormModal";
import { MedicationRow } from "./MedicationRow";
import { validateMedicationForm } from "@/features/medications/validations/medicationSchema";
import "./MedicationsView.css";

const duplicateMedicationMessage =
  "Já existe um medicamento com este nome, forma e dosagem.";
const listErrorFallback = "Não foi possível carregar os medicamentos.";
const medicationFieldErrorAliases = {
  form: ["medication"],
  genericName: ["medication"],
  strength: ["medication"],
};

export function MedicationsView({
  hasMedicationLoadError = false,
  isAdmin,
  isLoading,
  medications,
  onMedicationsChange,
  onSearchChange,
  searchTerm,
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [localSearch, setLocalSearch] = useState("");
  const [selectedMedicationId, setSelectedMedicationId] = useState("");
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [detailStatus, setDetailStatus] = useState({
    error: "",
    isLoading: false,
  });
  const [formMode, setFormMode] = useState("");
  const [form, setForm] = useState(() => createEmptyMedicationForm());
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [listError, setListError] = useState("");
  const [medicationToDelete, setMedicationToDelete] = useState(null);
  const [hasRecoveredFromInitialError, setHasRecoveredFromInitialError] =
    useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const globalSearchTerm = searchTerm ?? "";

  const sortedMedications = useMemo(
    () => sortMedications(medications),
    [medications],
  );
  const formFilters = useMemo(
    () => buildMedicationFormFilters(sortedMedications),
    [sortedMedications],
  );
  const visibleFilter = formFilters.some((filter) => filter.id === activeFilter)
    ? activeFilter
    : "all";
  const filteredByLocalControls = useMemo(
    () =>
      filterMedications(sortedMedications, {
        filterId: visibleFilter,
        searchTerm: localSearch,
      }),
    [localSearch, sortedMedications, visibleFilter],
  );
  const filteredMedications = useMemo(
    () =>
      globalSearchTerm
        ? filterMedications(filteredByLocalControls, {
            filterId: "all",
            searchTerm: globalSearchTerm,
          })
        : filteredByLocalControls,
    [filteredByLocalControls, globalSearchTerm],
  );

  const selectedFromList = selectedMedicationId
    ? filteredMedications.find(
        (medication) => medication.id === selectedMedicationId,
      ) ?? null
    : null;
  const visibleSelectedMedication =
    selectedMedication?.id === selectedFromList?.id
      ? selectedMedication
      : selectedFromList;
  const visibleSelectedMedicationId = selectedFromList?.id ?? "";
  const activeFilterLabel =
    formFilters.find((filter) => filter.id === visibleFilter)?.label ?? "Todas";
  const isBusy = isLoading || isRefreshing;
  const hasActiveFilters =
    Boolean(localSearch.trim()) ||
    Boolean(globalSearchTerm.trim()) ||
    visibleFilter !== "all";
  const duplicateMedication = findDuplicateMedication(
    sortedMedications,
    form,
    formMode === "edit" ? selectedMedicationId : "",
  );
  const duplicateWarning = duplicateMedication ? duplicateMedicationMessage : "";
  const effectiveListError =
    listError ||
    (!hasRecoveredFromInitialError && hasMedicationLoadError
      ? listErrorFallback
      : "");

  function applyMedicationList(nextMedications) {
    const nextSortedMedications = sortMedications(nextMedications);

    onMedicationsChange?.(nextSortedMedications);

    return nextSortedMedications;
  }

  async function refreshMedications(preferredMedicationId = selectedMedicationId) {
    setIsRefreshing(true);
    setListError("");

    try {
      const nextMedications = sortMedications(await listMedications());
      const nextSelected =
        nextMedications.find(
          (medication) => medication.id === preferredMedicationId,
        ) ?? null;

      onMedicationsChange?.(nextMedications);
      setSelectedMedicationId(nextSelected?.id ?? "");
      setSelectedMedication(nextSelected);
      setHasRecoveredFromInitialError(true);

      return nextMedications;
    } catch (error) {
      setListError(getRequestErrorMessage(error, listErrorFallback));
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleRetryList() {
    try {
      await refreshMedications();
    } catch {
      // O estado visual de falha já foi atualizado por refreshMedications.
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

    setFormMode("create");
    setForm(createEmptyMedicationForm());
    setFormErrors({});
    setSubmitError("");
    setFeedback("");
  }

  function handleSelectMedication(medication) {
    setFormMode("");
    setSelectedMedicationId(medication.id);
    setSelectedMedication(medication);
    setSubmitError("");
    setFormErrors({});
    loadMedicationDetail(medication);
  }

  function handleEdit(medication = visibleSelectedMedication) {
    if (!isAdmin || !medication) {
      return;
    }

    setFormMode("edit");
    setSelectedMedicationId(medication.id);
    setSelectedMedication(medication);
    setForm(createMedicationFormFromMedication(medication));
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
      clearFieldError(currentErrors, name, medicationFieldErrorAliases),
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationErrors = validateMedicationForm(form);

    if (duplicateMedication) {
      validationErrors.medication = duplicateMedicationMessage;
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
      if (formMode === "edit") {
        const updatedMedication = await updateMedication(
          selectedMedicationId,
          form,
        );

        if (updatedMedication) {
          applyMedicationList(
            upsertMedication(sortedMedications, updatedMedication),
          );
          setSelectedMedicationId(updatedMedication.id);
          setSelectedMedication(updatedMedication);
        } else {
          await refreshMedications(selectedMedicationId);
        }

        setFeedback("Medicamento atualizado com sucesso.");
      } else {
        const createdMedication = await createMedication(form);

        setActiveFilter("all");
        setLocalSearch("");

        if (createdMedication) {
          applyMedicationList(
            upsertMedication(sortedMedications, createdMedication),
          );
          setSelectedMedicationId(createdMedication.id);
          setSelectedMedication(createdMedication);
        } else {
          await refreshMedications();
        }

        setFeedback("Medicamento cadastrado com sucesso.");
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

  function handleAskDelete(medication = visibleSelectedMedication) {
    if (!isAdmin || !medication) {
      return;
    }

    setFormMode("");
    setMedicationToDelete(medication);
    setFeedback("");
  }

  async function handleConfirmDelete() {
    if (!isAdmin || !medicationToDelete || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      await deleteMedication(medicationToDelete.id);
      applyMedicationList(
        sortedMedications.filter(
          (medication) => medication.id !== medicationToDelete.id,
        ),
      );
      setMedicationToDelete(null);
      setSelectedMedicationId("");
      setSelectedMedication(null);
      setDetailStatus({ error: "", isLoading: false });
      setFeedback("Medicamento removido com sucesso.");
    } catch (error) {
      setDetailStatus({
        error: getRequestErrorMessage(error),
        isLoading: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClearFilters() {
    setActiveFilter("all");
    setLocalSearch("");
    onSearchChange?.("");
  }

  function renderEmptyState() {
    return (
      <div className="medication-empty-state">
        <strong>
          {hasActiveFilters
            ? "Nenhum medicamento encontrado."
            : "Nenhum medicamento cadastrado."}
        </strong>
        <span>
          {hasActiveFilters
            ? "Ajuste a busca ou os filtros para ampliar a listagem."
            : "Inclua o primeiro medicamento para usar nas prescrições."}
        </span>
        <div className="medication-empty-actions">
          {hasActiveFilters ? (
            <button
              className="dashboard-button dashboard-button-muted"
              type="button"
              onClick={handleClearFilters}
            >
              Limpar filtros
            </button>
          ) : null}
          {isAdmin ? (
            <button
              className="dashboard-button dashboard-button-primary"
              type="button"
              onClick={handleStartCreate}
            >
              Cadastrar medicamento
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="dashboard-two-column-layout medications-operational-layout">
        <section className="dashboard-panel medications-list-panel">
          <div className="medications-list-heading">
            <PanelHeader
              overline="Lista"
              title="Medicamentos ativos"
              action={`${filteredMedications.length} em ${activeFilterLabel}`}
            />

            {isAdmin ? (
              <button
                className="dashboard-button dashboard-button-primary"
                type="button"
                onClick={handleStartCreate}
              >
                Cadastrar medicamento
              </button>
            ) : null}
          </div>

          <div className="medications-toolbar">
            <label
              className="medications-search-field"
              htmlFor="medications-search"
            >
              <span className="sr-only">Buscar por nome genérico ou marca</span>
              <input
                id="medications-search"
                placeholder="Buscar por nome genérico ou marca"
                value={localSearch}
                onChange={(event) => setLocalSearch(event.target.value)}
              />
            </label>

            <div
              aria-label="Filtrar medicamentos por forma"
              className="dashboard-filter-group medication-form-filter-group"
            >
              {formFilters.map((filter) => (
                <button
                  aria-pressed={visibleFilter === filter.id}
                  className={`dashboard-filter-button medication-filter-button${
                    visibleFilter === filter.id ? " is-active" : ""
                  }`}
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                >
                  <span>{filter.label}</span>
                  <small>{filter.count}</small>
                </button>
              ))}
            </div>
          </div>

          {effectiveListError ? (
            <div className="medication-list-error" role="status">
              <span>{effectiveListError}</span>
              <button
                className="dashboard-button dashboard-button-muted"
                disabled={isRefreshing}
                type="button"
                onClick={handleRetryList}
              >
                {isRefreshing ? "Tentando..." : "Tentar novamente"}
              </button>
            </div>
          ) : isBusy ? (
            <LoadingRows />
          ) : filteredMedications.length > 0 ? (
            <div className="medication-table-wrap">
              <table className="medication-table">
                <caption className="sr-only">
                  Listagem operacional de medicamentos
                </caption>
                <thead>
                  <tr>
                    <th>Nome genérico</th>
                    <th>Marca</th>
                    <th>Forma</th>
                    <th>Dosagem</th>
                    <th>Atualizado em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedications.map((medication) => (
                    <MedicationRow
                      isAdmin={isAdmin}
                      isMutating={isSubmitting}
                      isSelected={visibleSelectedMedicationId === medication.id}
                      key={medication.id}
                      medication={medication}
                      onDelete={handleAskDelete}
                      onEdit={handleEdit}
                      onSelect={handleSelectMedication}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            renderEmptyState()
          )}
        </section>

        <section className="dashboard-panel medications-detail-panel">
          <MedicationDetailPanel
            detailStatus={detailStatus}
            isAdmin={isAdmin}
            isMutating={isSubmitting}
            medication={visibleSelectedMedication}
            onDelete={() => handleAskDelete(visibleSelectedMedication)}
            onEdit={() => handleEdit(visibleSelectedMedication)}
          />
        </section>
      </section>

      {formMode ? (
        <MedicationFormModal
          duplicateWarning={duplicateWarning}
          errors={formErrors}
          form={form}
          isSubmitting={isSubmitting}
          mode={formMode}
          submitError={submitError}
          onChange={handleFormChange}
          onClose={handleCancelForm}
          onSubmit={handleSubmit}
        />
      ) : null}

      {medicationToDelete ? (
        <MedicationDeleteModal
          isMutating={isSubmitting}
          medication={medicationToDelete}
          onClose={() => setMedicationToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      ) : null}

      {feedback ? (
        <div className="medication-toast" role="status">
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

function sortMedications(medications) {
  return [...medications].sort(compareByGenericName);
}

function upsertMedication(medications, nextMedication) {
  return [
    nextMedication,
    ...medications.filter((medication) => medication.id !== nextMedication.id),
  ];
}
