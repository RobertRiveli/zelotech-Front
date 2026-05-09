import { useEffect, useMemo, useState } from "react";
import { listMeasurementUnits } from "../../../../services/measurementUnitService";
import {
  createPrescription,
  deactivatePrescription,
  getPrescriptionById,
  listPrescriptions,
  updatePrescription,
} from "../../../../services/prescriptionService";
import { compareByStartDate } from "../../utils/dashboardSorters";
import {
  buildPrescriptionStats,
  filterPrescriptions,
  prescriptionFilters,
} from "../../utils/prescriptionDashboardUtils";
import { EmptyState } from "../shared/EmptyState";
import { LoadingRows } from "../shared/LoadingRows";
import { MetricCard } from "../shared/MetricCard";
import { PanelHeader } from "../shared/PanelHeader";
import { PrescriptionDetailPanel } from "./PrescriptionDetailPanel";
import { PrescriptionForm } from "./PrescriptionForm";
import { PrescriptionRow } from "./PrescriptionRow";

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
    setFormErrors((currentErrors) => clearFieldError(currentErrors, name));
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

    const confirmed = window.confirm(
      `Desativar a prescrição de ${visibleSelectedPrescription.resident?.fullName ?? "residente"}?`,
    );

    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      await deactivatePrescription(visibleSelectedPrescription.id);
      await refreshPrescriptions("");
      setMode("detail");
      setFeedback("Prescrição desativada com sucesso.");
    } catch (error) {
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

  return (
    <>
      <section className="dashboard-hero prescriptions-hero">
        <div className="dashboard-hero-copy">
          <span className="overline">Prescrições</span>
          <h2>Gestão das prescrições ativas</h2>
          <p>
            Cadastro clínico-operacional com residente, medicamento, dose,
            frequência e geração automática da agenda de administrações.
          </p>
        </div>

        <div className="dashboard-hero-status" aria-label="Resumo de prescrições">
          <span className="dashboard-company-status is-active">Ativas</span>
          <strong>{stats.active} prescrições</strong>
          <span>{stats.endingSoon} encerrando em 7 dias</span>
        </div>
      </section>

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

      <section className="prescriptions-layout">
        <section className="dashboard-panel prescriptions-list-panel">
          <div className="prescription-toolbar">
            <div className="prescription-filter-group" aria-label="Filtros">
              {prescriptionFilters.map((filter) => (
                <button
                  className={`prescription-filter-button${
                    activeFilter === filter.id ? " is-active" : ""
                  }`}
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <button
              className="prescription-button prescription-button-primary"
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
            <div className="prescription-success-alert" role="status">
              {feedback}
            </div>
          ) : null}

          {isBusy ? (
            <LoadingRows />
          ) : filteredPrescriptions.length > 0 ? (
            <div className="prescription-directory">
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
                action={mode === "edit" ? "PATCH" : "POST"}
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
    </>
  );
}

function createEmptyPrescriptionForm() {
  const today = formatDateInput(new Date());

  return {
    dosage: "",
    endDate: "",
    firstScheduledDate: today,
    firstScheduledTime: "08:00",
    frequency: "a cada 8 horas",
    intervalHours: "8",
    measurementUnitId: "",
    medicationId: "",
    prescribedBy: "",
    residentId: "",
    route: "oral",
    startDate: today,
  };
}

function createPrescriptionFormFromPrescription(prescription) {
  const firstScheduledDate =
    formatLocalDateInput(prescription.firstScheduledAt) || formatDateInput(new Date());
  const firstScheduledTime = formatTimeInput(prescription.firstScheduledAt) || "08:00";

  return {
    dosage: prescription.dosage ?? "",
    endDate: formatDateInput(prescription.endDate),
    firstScheduledDate,
    firstScheduledTime,
    frequency: prescription.frequency ?? "",
    intervalHours: String(prescription.intervalHours ?? ""),
    measurementUnitId:
      prescription.measurementUnitId ?? prescription.measurementUnit?.id ?? "",
    medicationId: prescription.medicationId ?? prescription.medication?.id ?? "",
    prescribedBy: prescription.prescribedBy ?? "",
    residentId: prescription.residentId ?? prescription.resident?.id ?? "",
    route: prescription.route ?? "",
    startDate: formatDateInput(prescription.startDate),
  };
}

function validatePrescriptionForm(form) {
  const errors = {};
  const intervalHours = Number(form.intervalHours);

  if (!form.residentId) {
    errors.residentId = "Selecione um residente.";
  }

  if (!form.medicationId) {
    errors.medicationId = "Selecione um medicamento.";
  }

  if (!form.measurementUnitId) {
    errors.measurementUnitId = "Selecione uma unidade.";
  }

  if (!form.dosage.trim()) {
    errors.dosage = "Informe a dosagem.";
  }

  if (!form.route.trim()) {
    errors.route = "Informe a via.";
  }

  if (!form.frequency.trim()) {
    errors.frequency = "Informe a frequência.";
  }

  if (!Number.isInteger(intervalHours) || intervalHours <= 0) {
    errors.intervalHours = "Use um número inteiro maior que zero.";
  }

  if (!form.firstScheduledDate || !form.firstScheduledTime) {
    errors.firstScheduledAt = "Informe a primeira data e horário.";
  }

  if (!form.prescribedBy.trim()) {
    errors.prescribedBy = "Informe o prescritor.";
  }

  if (!form.startDate) {
    errors.startDate = "Informe a data inicial.";
  }

  if (form.endDate && form.startDate && form.endDate < form.startDate) {
    errors.endDate = "A data final não pode ser menor que a inicial.";
  }

  if (
    form.firstScheduledDate &&
    form.startDate &&
    form.firstScheduledDate < form.startDate
  ) {
    errors.firstScheduledAt = "O primeiro horário não pode vir antes do início.";
  }

  if (
    form.endDate &&
    form.firstScheduledDate &&
    form.firstScheduledDate > form.endDate
  ) {
    errors.firstScheduledAt = "O primeiro horário não pode vir após o fim.";
  }

  return errors;
}

function clearFieldError(errors, fieldName) {
  const nextErrors = { ...errors };

  delete nextErrors[fieldName];

  if (fieldName === "firstScheduledDate" || fieldName === "firstScheduledTime") {
    delete nextErrors.firstScheduledAt;
  }

  return nextErrors;
}

function getRequestErrorMessage(error) {
  const fieldMessages = Object.values(error?.errors ?? {});

  return (
    fieldMessages.find(Boolean) ??
    error?.message ??
    "Não foi possível concluir a solicitação."
  );
}

function formatDateInput(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string" && value.length >= 10) {
    return value.slice(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-");
}

function formatLocalDateInput(value) {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-");
}

function formatTimeInput(value) {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  return `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
}

function padDatePart(value) {
  return String(value).padStart(2, "0");
}
