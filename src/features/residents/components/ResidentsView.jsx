import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getRecordResidentId,
} from "@/features/residents/utils/residentDashboardUtils";
import {
  isLateAdministration,
} from "@/features/medication-administrations/utils/administrationStatus";
import {
  isPrescriptionEndingSoon,
} from "@/features/prescriptions/utils/prescriptionDashboardUtils";
import {
  createResident,
  deleteResident,
  listResidentFamilyMembers,
  updateResident,
} from "@/features/residents/api/residentService";
import {
  createResidentCondition,
  listHealthConditions,
} from "@/features/residents/api/residentConditionService";
import {
  createResidentAccessCode,
  listResidentAccessCodes,
} from "@/features/family-access/api/familyAccessService";
import {
  createEmptyResidentForm,
  createResidentFormFromResident,
} from "@/features/residents/utils/residentForm";
import { validateResidentForm } from "@/features/residents/validations/residentSchema";
import { formatCpf, onlyNumbers } from "@/shared/utils/cpfFormatter";
import {
  clearFieldError,
  getRequestErrorMessage,
} from "@/shared/utils/formErrors";
import { ResidentsDirectory } from "./ResidentsDirectory";
import { ResidentAccessCodeModal } from "./ResidentAccessCodeModal";
import { ResidentDeleteModal } from "./ResidentDeleteModal";
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
  onResidentDeleted,
  onResidentUpdated,
  onSelectResident,
  overview,
  overviewStatus,
  prescriptions,
  residents,
  selectedResidentId,
}) {
  const [activeMetricFilter, setActiveMetricFilter] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => createEmptyResidentForm());
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [healthConditions, setHealthConditions] = useState([]);
  const [healthConditionsStatus, setHealthConditionsStatus] = useState({
    error: "",
    hasLoaded: false,
    isLoading: false,
  });
  const [residentToDelete, setResidentToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [accessResident, setAccessResident] = useState(null);
  const [accessForm, setAccessForm] = useState({ maxUses: "1" });
  const [accessFormErrors, setAccessFormErrors] = useState({});
  const [accessError, setAccessError] = useState("");
  const [accessCopyFeedback, setAccessCopyFeedback] = useState("");
  const [generatedAccess, setGeneratedAccess] = useState(null);
  const [isGeneratingAccess, setIsGeneratingAccess] = useState(false);
  const [accessCodesByResident, setAccessCodesByResident] = useState({});
  const [accessCodesStatus, setAccessCodesStatus] = useState({
    residentId: "",
    isLoading: false,
    error: "",
  });
  const [familyMembersByResident, setFamilyMembersByResident] = useState({});
  const [familyMembersStatus, setFamilyMembersStatus] = useState({
    residentId: "",
    isLoading: false,
    error: "",
  });
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
  const selectedResidentAccessCodes = selectedResident?.id
    ? (accessCodesByResident[selectedResident.id] ?? [])
    : [];
  const selectedAccessCodesStatus =
    accessCodesStatus.residentId === selectedResident?.id
      ? accessCodesStatus
      : { residentId: selectedResident?.id ?? "", isLoading: false, error: "" };
  const hasLoadedSelectedAccessCodes = selectedResident?.id
    ? Object.prototype.hasOwnProperty.call(accessCodesByResident, selectedResident.id)
    : false;
  const selectedResidentFamilyMembers = selectedResident?.id
    ? (familyMembersByResident[selectedResident.id] ?? [])
    : [];
  const selectedFamilyMembersStatus =
    familyMembersStatus.residentId === selectedResident?.id
      ? familyMembersStatus
      : { residentId: selectedResident?.id ?? "", isLoading: false, error: "" };
  const hasLoadedSelectedFamilyMembers = selectedResident?.id
    ? Object.prototype.hasOwnProperty.call(
        familyMembersByResident,
        selectedResident.id,
      )
    : false;

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback("");
    }, 4200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedback]);

  const loadResidentAccessCodes = useCallback(async (residentId) => {
    if (!residentId) {
      return;
    }

    setAccessCodesStatus({
      residentId,
      isLoading: true,
      error: "",
    });

    try {
      const accessCodes = await listResidentAccessCodes(residentId);

      setAccessCodesByResident((currentAccessCodes) => ({
        ...currentAccessCodes,
        [residentId]: accessCodes,
      }));
      setAccessCodesStatus({
        residentId,
        isLoading: false,
        error: "",
      });
    } catch (error) {
      setAccessCodesStatus({
        residentId,
        isLoading: false,
        error: getRequestErrorMessage(
          error,
          "Não foi possível carregar os códigos deste residente.",
        ),
      });
    }
  }, []);

  const loadResidentFamilyMembers = useCallback(async (residentId) => {
    if (!residentId) {
      return;
    }

    setFamilyMembersStatus({
      residentId,
      isLoading: true,
      error: "",
    });

    try {
      const familyMembers = await listResidentFamilyMembers(residentId);

      setFamilyMembersByResident((currentFamilyMembers) => ({
        ...currentFamilyMembers,
        [residentId]: familyMembers,
      }));
      setFamilyMembersStatus({
        residentId,
        isLoading: false,
        error: "",
      });
    } catch (error) {
      setFamilyMembersStatus({
        residentId,
        isLoading: false,
        error: getRequestErrorMessage(
          error,
          "Não foi possível carregar os familiares deste residente.",
        ),
      });
    }
  }, []);

  const loadHealthConditions = useCallback(async () => {
    setHealthConditionsStatus({
      error: "",
      hasLoaded: false,
      isLoading: true,
    });

    try {
      const conditions = await listHealthConditions();

      setHealthConditions(conditions);
      setHealthConditionsStatus({
        error: "",
        hasLoaded: true,
        isLoading: false,
      });
    } catch (error) {
      setHealthConditionsStatus({
        error: getRequestErrorMessage(
          error,
          "Não foi possível carregar as condições de saúde.",
        ),
        hasLoaded: true,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    if (!isAdmin || !selectedResident?.id || hasLoadedSelectedAccessCodes) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      loadResidentAccessCodes(selectedResident.id);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    hasLoadedSelectedAccessCodes,
    isAdmin,
    loadResidentAccessCodes,
    selectedResident?.id,
  ]);

  useEffect(() => {
    if (!isAdmin || !selectedResident?.id || hasLoadedSelectedFamilyMembers) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      loadResidentFamilyMembers(selectedResident.id);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    hasLoadedSelectedFamilyMembers,
    isAdmin,
    loadResidentFamilyMembers,
    selectedResident?.id,
  ]);

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
    setIsEditing(false);
    setActiveMetricFilter("");
    setForm(createEmptyResidentForm());
    setFormErrors({});
    setSubmitError("");
    setFeedback("");
    setFeedbackTone("success");

    if (!healthConditionsStatus.hasLoaded && !healthConditionsStatus.isLoading) {
      loadHealthConditions();
    }
  }

  function handleCancelCreate() {
    setIsCreating(false);
    setIsEditing(false);
    setFormErrors({});
    setSubmitError("");
    setFeedbackTone("success");
  }

  function handleResidentSelect(residentId) {
    setIsCreating(false);
    setIsEditing(false);
    setFormErrors({});
    setSubmitError("");
    setFeedbackTone("success");
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

  function handleHealthConditionToggle(conditionId, isSelected) {
    setForm((currentForm) => {
      const currentConditionIds = currentForm.healthConditionIds ?? [];
      const nextConditionIds = isSelected
        ? Array.from(new Set([...currentConditionIds, conditionId]))
        : currentConditionIds.filter((currentId) => currentId !== conditionId);
      const nextObservations = {
        ...(currentForm.healthConditionObservations ?? {}),
      };

      if (!isSelected) {
        delete nextObservations[conditionId];
      }

      return {
        ...currentForm,
        healthConditionIds: nextConditionIds,
        healthConditionObservations: nextObservations,
      };
    });
    setFormErrors((currentErrors) =>
      clearHealthConditionObservationError(currentErrors, conditionId),
    );
  }

  function handleHealthConditionObservationChange(conditionId, value) {
    setForm((currentForm) => ({
      ...currentForm,
      healthConditionObservations: {
        ...(currentForm.healthConditionObservations ?? {}),
        [conditionId]: value,
      },
    }));
    setFormErrors((currentErrors) =>
      clearHealthConditionObservationError(currentErrors, conditionId),
    );
  }

  function handleStartEdit() {
    if (!isAdmin || !selectedResident) {
      return;
    }

    setIsCreating(false);
    setIsEditing(true);
    setForm(createResidentFormFromResident(selectedResident));
    setFormErrors({});
    setSubmitError("");
    setFeedback("");
    setFeedbackTone("success");
  }

  async function handleSubmitResident(event) {
    event.preventDefault();

    if (isEditing && !selectedResident) {
      setSubmitError("Selecione um residente antes de salvar as alterações.");
      return;
    }

    const validationErrors = validateResidentForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setSubmitError("Revise os campos destacados antes de salvar.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setFeedback("");
    setFeedbackTone("success");

    try {
      if (isEditing) {
        const updatedResident = await updateResident(selectedResident.id, form);

        onResidentUpdated?.(updatedResident);
        setFeedbackTone("success");
        setFeedback("Residente atualizado com sucesso.");
      } else {
        const createdResident = await createResident(form);

        await createSelectedHealthConditionLinks(createdResident.id);

        onResidentCreated?.(createdResident);
        setActiveMetricFilter("");
        setFeedbackTone("success");
        setFeedback("Residente cadastrado com sucesso.");
      }

      setIsCreating(false);
      setIsEditing(false);
      setForm(createEmptyResidentForm());
      setFormErrors({});
    } catch (error) {
      const nextErrors = { ...(error?.errors ?? {}) };
      const roleError = nextErrors.role;

      delete nextErrors.role;
      setFormErrors(nextErrors);
      setSubmitError(
        roleError ||
          getRequestErrorMessage(
            error,
            isEditing
              ? "Não foi possível atualizar o residente. Tente novamente."
              : "Não foi possível cadastrar o residente. Tente novamente.",
          ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function createSelectedHealthConditionLinks(residentId) {
    const selectedConditionIds = form.healthConditionIds ?? [];

    if (selectedConditionIds.length === 0) {
      return { failed: 0, total: 0 };
    }

    const settledLinks = await Promise.allSettled(
      selectedConditionIds.map((healthConditionId) =>
        createResidentCondition({
          residentId,
          healthConditionId,
          observations: form.healthConditionObservations?.[healthConditionId],
        }),
      ),
    );

    return {
      failed: settledLinks.filter((link) => link.status === "rejected").length,
      total: selectedConditionIds.length,
    };
  }

  function handleRequestDeleteResident() {
    if (!isAdmin || !selectedResident) {
      return;
    }

    setResidentToDelete(selectedResident);
    setDeleteError("");
    setFeedback("");
    setFeedbackTone("success");
  }

  function handleCloseDeleteModal() {
    if (isDeleting) {
      return;
    }

    setResidentToDelete(null);
    setDeleteError("");
  }

  async function handleConfirmDeleteResident() {
    if (!isAdmin || !residentToDelete) {
      return;
    }

    setIsDeleting(true);
    setDeleteError("");
    setFeedback("");

    try {
      const deletedResident = await deleteResident(residentToDelete.id);

      onResidentDeleted?.(deletedResident ?? residentToDelete);
      setResidentToDelete(null);
      setActiveMetricFilter("");
      setFeedbackTone("success");
      setFeedback("Residente excluído com sucesso.");
    } catch (error) {
      setDeleteError(
        getRequestErrorMessage(
          error,
          "Não foi possível excluir o residente. Tente novamente.",
        ),
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function handleRequestGenerateAccess() {
    if (!isAdmin || !selectedResident) {
      return;
    }

    setAccessResident(selectedResident);
    setAccessForm({ maxUses: "1" });
    setAccessFormErrors({});
    setAccessError("");
    setAccessCopyFeedback("");
    setGeneratedAccess(null);
    setFeedback("");
    setFeedbackTone("success");
  }

  function handleCloseAccessModal() {
    if (isGeneratingAccess) {
      return;
    }

    setAccessResident(null);
    setAccessFormErrors({});
    setAccessError("");
    setAccessCopyFeedback("");
    setGeneratedAccess(null);
  }

  function handleAccessFormChange(event) {
    const { name, value } = event.target;

    setAccessForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    setAccessFormErrors((currentErrors) => clearFieldError(currentErrors, name));
    setAccessError("");
    setAccessCopyFeedback("");
  }

  async function handleGenerateAccessCode(event) {
    event.preventDefault();

    if (!isAdmin || !accessResident) {
      return;
    }

    const validationErrors = validateAccessCodeForm(accessForm);

    if (Object.keys(validationErrors).length > 0) {
      setAccessFormErrors(validationErrors);
      setAccessError("Revise os campos destacados antes de gerar o código.");
      return;
    }

    setIsGeneratingAccess(true);
    setAccessFormErrors({});
    setAccessError("");
    setAccessCopyFeedback("");

    try {
      const accessCode = await createResidentAccessCode(
        accessResident.id,
        accessForm,
      );

      setGeneratedAccess(normalizeAccessCode(accessCode));
      setFeedbackTone("success");
      setFeedback("Código criado com sucesso.");
      await loadResidentAccessCodes(accessResident.id);
    } catch (error) {
      setAccessFormErrors(error?.errors ?? {});
      setAccessError(
        getRequestErrorMessage(
          error,
          "Não foi possível gerar o código. Tente novamente.",
        ),
      );
    } finally {
      setIsGeneratingAccess(false);
    }
  }

  async function handleCopyOverviewAccessCode(code) {
    if (!code) {
      return;
    }

    if (!navigator.clipboard?.writeText) {
      setFeedbackTone("success");
      setFeedback(`Código ${code} pronto para copiar manualmente.`);
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setFeedbackTone("success");
      setFeedback(`Código ${code} copiado.`);
    } catch {
      setFeedbackTone("success");
      setFeedback(`Código ${code} pronto para copiar manualmente.`);
    }
  }

  async function handleCopyAccessCode(code) {
    if (!code) {
      return;
    }

    if (!navigator.clipboard?.writeText) {
      setAccessCopyFeedback(`Código ${code} pronto para copiar manualmente.`);
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setAccessCopyFeedback(`Código ${code} copiado.`);
    } catch {
      setAccessCopyFeedback(`Código ${code} pronto para copiar manualmente.`);
    }
  }

  return (
    <>
      {feedback ? (
        <div
          className={`resident-global-toast is-${feedbackTone}`}
          role="status"
        >
          {feedback}
        </div>
      ) : null}

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
          {isCreating || isEditing ? (
            <>
              <PanelHeader
                overline={isEditing ? "Edição" : "Cadastro"}
                title={isEditing ? "Editar residente" : "Novo residente"}
              />
              <ResidentForm
                errors={formErrors}
                form={form}
                healthConditions={healthConditions}
                healthConditionsStatus={healthConditionsStatus}
                isSubmitting={isSubmitting}
                maskCpfField={isEditing}
                showHealthConditions={isCreating}
                submitLabel={isEditing ? "Salvar alterações" : "Salvar residente"}
                submitError={submitError}
                onCancel={handleCancelCreate}
                onChange={handleFormChange}
                onHealthConditionObservationChange={
                  handleHealthConditionObservationChange
                }
                onHealthConditionToggle={handleHealthConditionToggle}
                onSubmit={handleSubmitResident}
              />
            </>
          ) : (
            <ResidentOverviewPanel
              accessCodes={selectedResidentAccessCodes}
              accessCodesStatus={selectedAccessCodesStatus}
              currentTime={currentTime}
              familyMembers={selectedResidentFamilyMembers}
              familyMembersStatus={selectedFamilyMembersStatus}
              isAdmin={isAdmin}
              isDeleting={isDeleting}
              isGeneratingAccess={isGeneratingAccess}
              isSubmitting={isSubmitting}
              onCopyAccessCode={handleCopyOverviewAccessCode}
              onDelete={handleRequestDeleteResident}
              onEdit={handleStartEdit}
              onGenerateAccess={handleRequestGenerateAccess}
              overview={overview}
              overviewStatus={overviewStatus}
              resident={selectedResident}
            />
          )}
        </section>
      </section>

      <ResidentDeleteModal
        error={deleteError}
        isDeleting={isDeleting}
        resident={residentToDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDeleteResident}
      />
      <ResidentAccessCodeModal
        copyFeedback={accessCopyFeedback}
        error={accessError}
        fieldErrors={accessFormErrors}
        form={accessForm}
        generatedAccess={generatedAccess}
        isGenerating={isGeneratingAccess}
        resident={accessResident}
        onChange={handleAccessFormChange}
        onClose={handleCloseAccessModal}
        onCopy={handleCopyAccessCode}
        onSubmit={handleGenerateAccessCode}
      />
    </>
  );
}

function clearHealthConditionObservationError(errors, conditionId) {
  if (!errors.healthConditionObservations?.[conditionId]) {
    return errors;
  }

  const nextObservationErrors = { ...errors.healthConditionObservations };
  delete nextObservationErrors[conditionId];

  if (Object.keys(nextObservationErrors).length === 0) {
    const remainingErrors = { ...errors };
    delete remainingErrors.healthConditionObservations;

    return remainingErrors;
  }

  return {
    ...errors,
    healthConditionObservations: nextObservationErrors,
  };
}

function validateAccessCodeForm(form) {
  const errors = {};
  const maxUses = Number(form.maxUses);

  if (!Number.isInteger(maxUses) || maxUses < 1) {
    errors.maxUses = "Informe um limite de usos válido.";
  }

  return errors;
}

function normalizeAccessCode(accessCode) {
  const maxUses = Number(accessCode.maxUses);

  return {
    code: accessCode.code,
    expiresAt: accessCode.expiresAt,
    maxUses: Number.isInteger(maxUses) && maxUses > 0 ? maxUses : 1,
    residentId: accessCode.residentId ?? "",
  };
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
