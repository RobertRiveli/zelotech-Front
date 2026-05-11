import { useMemo, useState } from "react";
import {
  getRecordResidentId,
} from "@/features/residents/utils/residentDashboardUtils";
import {
  isLateAdministration,
} from "@/features/medication-administrations/utils/administrationStatus";
import {
  isPrescriptionEndingSoon,
} from "@/features/prescriptions/utils/prescriptionDashboardUtils";
import { createResident } from "@/features/residents/api/residentService";
import { createEmptyResidentForm } from "@/features/residents/utils/residentForm";
import { validateResidentForm } from "@/features/residents/validations/residentSchema";
import { formatCpf, onlyNumbers } from "@/shared/utils/cpfFormatter";
import {
  clearFieldError,
  getRequestErrorMessage,
} from "@/shared/utils/formErrors";
import { ResidentsDirectory } from "./ResidentsDirectory";
import { ResidentForm } from "./ResidentForm";
import { ResidentOverviewPanel } from "./ResidentOverviewPanel";
import { MetricCard } from "@/shared/ui/MetricCard";
import { PanelHeader } from "@/shared/ui/PanelHeader";
import "./ResidentsView.css";

export function ResidentsView({
  administrations,
  allResidents,
  currentTime,
  isAdmin,
  isLoading,
  onResidentCreated,
  onSelectResident,
  overview,
  overviewStatus,
  prescriptions,
  residents,
  selectedResidentId,
}) {
  const [activeMetricFilter, setActiveMetricFilter] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(() => createEmptyResidentForm());
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const metricCards = useMemo(
    () =>
      buildResidentMetricCards({
        administrations,
        currentTime,
        prescriptions,
        residents,
      }),
    [administrations, currentTime, prescriptions, residents],
  );
  const activeMetric = metricCards.find((metric) => metric.id === activeMetricFilter);
  const visibleResidents = activeMetric?.residents ?? residents;
  const selectedResident =
    overview?.resident?.id === selectedResidentId
      ? overview.resident
      : (visibleResidents.find((resident) => resident.id === selectedResidentId) ??
        residents.find((resident) => resident.id === selectedResidentId) ??
        allResidents.find((resident) => resident.id === selectedResidentId) ??
        null);

  function handleMetricClick(metric) {
    const nextFilter = activeMetricFilter === metric.id ? "" : metric.id;

    setActiveMetricFilter(nextFilter);

    if (!nextFilter) {
      return;
    }

    const selectedResidentIsVisible = metric.residents.some(
      (resident) => resident.id === selectedResidentId,
    );

    if (!selectedResidentIsVisible) {
      onSelectResident(metric.residents[0]?.id ?? "");
    }
  }

  function handleClearMetricFilter() {
    setActiveMetricFilter("");
  }

  function handleStartCreate() {
    if (!isAdmin) {
      return;
    }

    setIsCreating(true);
    setActiveMetricFilter("");
    setForm(createEmptyResidentForm());
    setFormErrors({});
    setSubmitError("");
    setFeedback("");
  }

  function handleCancelCreate() {
    setIsCreating(false);
    setFormErrors({});
    setSubmitError("");
  }

  function handleResidentSelect(residentId) {
    setIsCreating(false);
    setFormErrors({});
    setSubmitError("");
    onSelectResident(residentId);
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    const nextValue =
      name === "cpf" ? formatCpf(onlyNumbers(value).slice(0, 11)) : value;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: nextValue,
    }));
    setFormErrors((currentErrors) => clearFieldError(currentErrors, name));
  }

  async function handleCreateResident(event) {
    event.preventDefault();

    const validationErrors = validateResidentForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setSubmitError("Revise os campos destacados antes de salvar.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setFeedback("");

    try {
      const createdResident = await createResident(form);

      onResidentCreated?.(createdResident);
      setIsCreating(false);
      setForm(createEmptyResidentForm());
      setFormErrors({});
      setActiveMetricFilter("");
      setFeedback("Residente cadastrado com sucesso.");
    } catch (error) {
      const nextErrors = { ...(error?.errors ?? {}) };
      const roleError = nextErrors.role;

      delete nextErrors.role;
      setFormErrors(nextErrors);
      setSubmitError(
        roleError ||
          getRequestErrorMessage(
            error,
            "Não foi possível cadastrar o residente. Tente novamente.",
          ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section className="dashboard-overview-grid" aria-label="Resumo de residentes">
        {metricCards.map((metric) => (
          <MetricCard
            detail={metric.detail}
            isActive={activeMetricFilter === metric.id}
            key={metric.id}
            label={metric.label}
            loading={isLoading}
            tone={metric.tone}
            value={metric.value}
            onClick={() => handleMetricClick(metric)}
          />
        ))}
      </section>

      <section className="residents-layout">
        <section className="dashboard-panel residents-list-panel">
          {isAdmin ? (
            <div className="dashboard-toolbar residents-toolbar">
              <button
                className="dashboard-button dashboard-button-primary"
                type="button"
                onClick={handleStartCreate}
              >
                Novo residente
              </button>
            </div>
          ) : null}

          <PanelHeader
            overline="Lista"
            title="Residentes"
            action={`${visibleResidents.length} encontrados`}
          />
          {feedback ? (
            <div
              className="dashboard-form-alert dashboard-form-alert-success"
              role="status"
            >
              {feedback}
            </div>
          ) : null}
          {activeMetric ? (
            <div
              aria-live="polite"
              className="resident-filter-feedback"
              key={activeMetric.id}
              role="status"
            >
              <span className="resident-filter-feedback-label">
                Filtro aplicado: <strong>{activeMetric.label}</strong>
              </span>
              <button type="button" onClick={handleClearMetricFilter}>
                Limpar filtro
              </button>
            </div>
          ) : null}
          <ResidentsDirectory
            administrations={administrations}
            currentTime={currentTime}
            isLoading={isLoading}
            onSelectResident={handleResidentSelect}
            prescriptions={prescriptions}
            residents={visibleResidents}
            selectedResidentId={selectedResidentId}
          />
        </section>

        <section className="dashboard-panel residents-detail-panel">
          {isCreating ? (
            <>
              <PanelHeader overline="Cadastro" title="Novo residente" />
              <ResidentForm
                errors={formErrors}
                form={form}
                isSubmitting={isSubmitting}
                submitError={submitError}
                onCancel={handleCancelCreate}
                onChange={handleFormChange}
                onSubmit={handleCreateResident}
              />
            </>
          ) : (
            <ResidentOverviewPanel
              currentTime={currentTime}
              overview={overview}
              overviewStatus={overviewStatus}
              resident={selectedResident}
            />
          )}
        </section>
      </section>
    </>
  );
}

function buildResidentMetricCards({
  administrations,
  currentTime,
  prescriptions,
  residents,
}) {
  const lateResidents = filterResidentsByIds(
    residents,
    new Set(
      administrations
        .filter((administration) => isLateAdministration(administration, currentTime))
        .map(getRecordResidentId),
    ),
  );
  const pendingResidents = filterResidentsByIds(
    residents,
    new Set(
      administrations
        .filter((administration) => (administration.status ?? "PENDING") === "PENDING")
        .map(getRecordResidentId),
    ),
  );
  const endingPrescriptionResidents = filterResidentsByIds(
    residents,
    new Set(
      prescriptions
        .filter((prescription) =>
          isPrescriptionEndingSoon(prescription, currentTime),
        )
        .map(getRecordResidentId),
    ),
  );
  const incompleteResidents = residents.filter(hasIncompleteRegistration);

  return [
    {
      id: "late-medication",
      label: "Medicação atrasada",
      value: lateResidents.length,
      detail: "residentes exigem conferência",
      tone: lateResidents.length > 0 ? "danger" : "success",
      residents: lateResidents,
    },
    {
      id: "pending-today",
      label: "Pendências hoje",
      value: pendingResidents.length,
      detail: "residentes com doses pendentes",
      tone: pendingResidents.length > 0 ? "danger" : "success",
      residents: pendingResidents,
    },
    {
      id: "ending-prescriptions",
      label: "Prescrições encerrando",
      value: endingPrescriptionResidents.length,
      detail: "residentes nos próximos 7 dias",
      tone: endingPrescriptionResidents.length > 0 ? "danger" : "success",
      residents: endingPrescriptionResidents,
    },
    {
      id: "incomplete-records",
      label: "Cadastros incompletos",
      value: incompleteResidents.length,
      detail: "residentes sem dados essenciais",
      tone: incompleteResidents.length > 0 ? "danger" : "success",
      residents: incompleteResidents,
    },
  ];
}

function filterResidentsByIds(residents, residentIds) {
  return residents.filter((resident) => residentIds.has(resident.id));
}

function hasIncompleteRegistration(resident) {
  return [
    resident.cpf,
    resident.birthDate,
    resident.admissionDate,
    resident.bloodType,
    resident.gender,
  ].some((value) => !value);
}
