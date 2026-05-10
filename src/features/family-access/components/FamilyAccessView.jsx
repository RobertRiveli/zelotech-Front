import { useMemo, useState } from "react";
import { createResidentAccessCode } from "@/features/family-access/api/familyAccessService";
import {
  clearFieldError,
  getRequestErrorMessage,
} from "@/shared/utils/formErrors";
import { normalizeText } from "@/shared/utils/textFormatter";
import { formatShortDateTime } from "@/shared/utils/dateFormatter";
import { matchesSearch } from "@/shared/utils/search";
import { EmptyState } from "@/shared/ui/EmptyState";
import { FieldError } from "@/shared/ui/FieldError";
import { LoadingRows } from "@/shared/ui/LoadingRows";
import { MetricCard } from "@/shared/ui/MetricCard";
import { PanelHeader } from "@/shared/ui/PanelHeader";
import { ResidentListItem } from "@/features/residents/components/ResidentListItem";
import "./FamilyAccessView.css";

const relationshipOptions = [
  "Filho",
  "Filha",
  "Neto",
  "Neta",
  "Responsável",
  "Outro",
];

const familyFlowSteps = [
  "O administrador gera um código para o residente.",
  "O familiar acessa a área da família e informa o código recebido.",
  "O familiar escolhe o relacionamento e o vínculo é criado automaticamente.",
];

const initialForm = {
  maxUses: "1",
  residentId: "",
};

const fieldErrorAliases = {
  residentId: ["resident"],
};

export function FamilyAccessView({ currentTime, isLoading, residents, searchTerm }) {
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [generatedAccess, setGeneratedAccess] = useState(null);
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedResidents = useMemo(
    () =>
      [...residents].sort((firstResident, secondResident) =>
        (firstResident.fullName ?? "").localeCompare(
          secondResident.fullName ?? "",
          "pt-BR",
        ),
      ),
    [residents],
  );
  const visibleResidents = useMemo(
    () => filterResidents(sortedResidents, searchTerm),
    [searchTerm, sortedResidents],
  );
  const hasFormResident = sortedResidents.some(
    (resident) => resident.id === form.residentId,
  );
  const selectedResidentId = hasFormResident
    ? form.residentId
    : sortedResidents[0]?.id ?? "";
  const selectedResident = sortedResidents.find(
    (resident) => resident.id === selectedResidentId,
  );
  const activeResidentsCount = sortedResidents.filter(isActiveResident).length;
  const latestExpirationLabel = generatedCodes[0]?.expiresAt
    ? formatShortDateTime(generatedCodes[0].expiresAt)
    : "24h após emissão";

  function handleResidentSelect(residentId) {
    setForm((currentForm) => ({
      ...currentForm,
      residentId,
    }));
    setFormErrors((currentErrors) =>
      clearFieldError(currentErrors, "residentId", fieldErrorAliases),
    );
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
    setSubmitError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateFamilyAccessForm(form, selectedResidentId);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setSubmitError("Revise os campos destacados antes de gerar o código.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setFeedback("");

    try {
      const accessCode = await createResidentAccessCode(selectedResidentId, form);
      const accessRecord = buildAccessRecord(accessCode, selectedResident);

      setGeneratedAccess(accessRecord);
      setGeneratedCodes((currentCodes) => [accessRecord, ...currentCodes]);
      setFeedback("Código criado com sucesso.");
      setFormErrors({});
    } catch (error) {
      setFormErrors(error?.errors ?? {});
      setSubmitError(
        getRequestErrorMessage(
          error,
          "Não foi possível gerar o código. Tente novamente.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyCode(code) {
    if (!code) {
      return;
    }

    if (!navigator.clipboard?.writeText) {
      setFeedback(`Código ${code} pronto para copiar manualmente.`);
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setFeedback(`Código ${code} copiado.`);
    } catch {
      setFeedback(`Código ${code} pronto para copiar manualmente.`);
    }
  }

  const maxUsesValue = Number(form.maxUses);
  const maxUsesMetric =
    Number.isInteger(maxUsesValue) && maxUsesValue > 0 ? maxUsesValue : 1;

  return (
    <>
      <section className="dashboard-hero family-access-hero">
        <div className="dashboard-hero-copy">
          <span className="overline">Família / Acessos</span>
          <h2>Liberação de acesso para familiares</h2>
          <p>
            Gere códigos temporários para que familiares autenticados possam
            criar vínculo com residentes sem expor dados sensíveis da instituição.
          </p>
        </div>

        <div className="dashboard-hero-status" aria-label="Resumo de acessos">
          <span className="dashboard-company-status is-active">Área admin</span>
          <strong>Códigos temporários</strong>
          <span>Expiram em 1 dia após a criação</span>
        </div>
      </section>

      <section className="dashboard-overview-grid" aria-label="Resumo de acessos">
        <MetricCard
          label="Residentes cadastrados"
          value={sortedResidents.length}
          detail={`${activeResidentsCount} ativos na instituição`}
          loading={isLoading}
        />
        <MetricCard
          label="Códigos gerados"
          value={generatedCodes.length}
          detail="nesta sessão administrativa"
          loading={false}
        />
        <MetricCard
          label="Usos por código"
          value={maxUsesMetric}
          detail="limite configurado no formulário"
          loading={false}
        />
        <MetricCard
          label="Próxima expiração"
          value={generatedCodes.length > 0 ? "Ativa" : "24h"}
          detail={latestExpirationLabel}
          loading={false}
        />
      </section>

      <section className="dashboard-two-column-layout">
        <section className="dashboard-panel family-access-list-panel">
          <PanelHeader
            overline="Geração"
            title="Criar código de acesso"
            action={`${visibleResidents.length} residentes visíveis`}
          />

          <form className="family-access-form" onSubmit={handleSubmit}>
            {submitError ? (
              <div
                className="dashboard-form-alert dashboard-form-alert-danger"
                role="status"
              >
                {submitError}
              </div>
            ) : null}

            {feedback ? (
              <div
                className="dashboard-form-alert dashboard-form-alert-success"
                role="status"
              >
                {feedback}
              </div>
            ) : null}

            <div className="family-access-form-grid">
              <label className="dashboard-field">
                <span>Residente</span>
                <select
                  disabled={isSubmitting || isLoading || sortedResidents.length === 0}
                  name="residentId"
                  value={selectedResidentId}
                  onChange={handleFormChange}
                >
                  <option value="">Selecione</option>
                  {sortedResidents.map((resident) => (
                    <option key={resident.id} value={resident.id}>
                      {resident.fullName}
                    </option>
                  ))}
                </select>
                <FieldError
                  message={formErrors.residentId || formErrors.resident}
                />
              </label>

              <label className="dashboard-field">
                <span>Limite de usos</span>
                <input
                  min="1"
                  name="maxUses"
                  type="number"
                  value={form.maxUses}
                  onChange={handleFormChange}
                />
                <FieldError message={formErrors.maxUses} />
              </label>
            </div>

            <div className="family-access-note" role="note">
              O código é gerado para o residente selecionado e deve ser
              compartilhado pelo canal definido pela instituição.
            </div>

            <div className="dashboard-form-actions">
              <button
                className="dashboard-button dashboard-button-primary"
                disabled={isSubmitting || isLoading || sortedResidents.length === 0}
                type="submit"
              >
                {isSubmitting ? "Gerando..." : "Gerar código"}
              </button>
            </div>
          </form>

          <div className="family-access-resident-list" aria-label="Residentes">
            {isLoading ? (
              <LoadingRows />
            ) : visibleResidents.length > 0 ? (
              visibleResidents.map((resident) => (
            <ResidentListItem
                  className="family-access-resident-row"
                  currentTime={currentTime}
                  isSelected={resident.id === selectedResidentId}
                  key={resident.id}
                  resident={resident}
                  stats={[
                    "Código temporário",
                    "Validade de 24h",
                    "Sem dados sensíveis",
                  ]}
                  statsAriaLabel="Resumo de acesso familiar"
                  onSelectResident={handleResidentSelect}
                />
              ))
            ) : (
              <EmptyState title="Nenhum residente encontrado para a busca atual." />
            )}
          </div>
        </section>

        <section className="dashboard-panel family-access-detail-panel">
          <PanelHeader
            overline={generatedAccess ? "Código" : "Orientação"}
            title={generatedAccess ? "Código pronto para compartilhar" : "Fluxo seguro"}
            action={generatedAccess ? "Copiar" : "Admin"}
          />

          {generatedAccess ? (
            <GeneratedAccessCode
              access={generatedAccess}
              onCopyCode={handleCopyCode}
            />
          ) : (
            <FamilyAccessPlaceholder selectedResident={selectedResident} />
          )}

          <section className="family-access-guidance" aria-label="Fluxo do familiar">
            <div className="family-access-section-header">
              <span className="overline">Como funciona</span>
              <h3>Do código ao vínculo</h3>
            </div>

            <div className="family-access-step-list">
              {familyFlowSteps.map((step, index) => (
                <div className="family-access-step" key={step}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </section>

          <section
            className="family-access-relationships"
            aria-label="Relacionamentos aceitos"
          >
            <div className="family-access-section-header">
              <span className="overline">Relacionamento</span>
              <h3>Opções aceitas no resgate</h3>
            </div>

            <div className="family-access-chip-list">
              {relationshipOptions.map((relationship) => (
                <span key={relationship}>{relationship}</span>
              ))}
            </div>
          </section>

          <section className="family-access-history" aria-label="Histórico local">
            <div className="family-access-section-header">
              <span className="overline">Sessão</span>
              <h3>Códigos gerados agora</h3>
            </div>

            {generatedCodes.length > 0 ? (
              <div className="family-access-history-list">
                {generatedCodes.map((access) => (
                  <div className="family-access-history-item" key={access.id}>
                    <div>
                      <strong>{access.code}</strong>
                      <span>{access.residentName}</span>
                      <small>Expira em {formatShortDateTime(access.expiresAt)}</small>
                    </div>
                    <button
                      className="dashboard-button dashboard-button-muted"
                      type="button"
                      onClick={() => handleCopyCode(access.code)}
                    >
                      Copiar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Os códigos gerados nesta tela aparecerão aqui durante a sessão." />
            )}
          </section>
        </section>
      </section>
    </>
  );
}

function GeneratedAccessCode({ access, onCopyCode }) {
  return (
    <div className="family-access-code-card">
      <span>Compartilhe este código com o familiar</span>
      <strong className="family-access-code-value">{access.code}</strong>

      <div className="family-access-code-meta">
        <span>{access.residentName}</span>
        <span>Expira em {formatShortDateTime(access.expiresAt)}</span>
        <span>{access.maxUses} uso{access.maxUses === 1 ? "" : "s"}</span>
      </div>

      <div className="family-access-code-actions">
        <button
          className="dashboard-button dashboard-button-primary"
          type="button"
          onClick={() => onCopyCode(access.code)}
        >
          Copiar código
        </button>
      </div>
    </div>
  );
}

function FamilyAccessPlaceholder({ selectedResident }) {
  return (
    <div className="family-access-placeholder">
      <strong>
        {selectedResident
          ? `Pronto para gerar acesso para ${selectedResident.fullName}`
          : "Selecione um residente para começar"}
      </strong>
      <p>
        Depois da geração, o código aparecerá aqui com data de expiração e ação
        rápida para cópia.
      </p>
    </div>
  );
}

function validateFamilyAccessForm(form, selectedResidentId) {
  const errors = {};
  const maxUses = Number(form.maxUses);

  if (!selectedResidentId) {
    errors.residentId = "Selecione um residente.";
  }

  if (!Number.isInteger(maxUses) || maxUses < 1) {
    errors.maxUses = "Informe um limite de usos válido.";
  }

  return errors;
}

function buildAccessRecord(accessCode, resident) {
  const maxUses = Number(accessCode.maxUses);

  return {
    code: accessCode.code,
    createdAt: new Date().toISOString(),
    expiresAt: accessCode.expiresAt,
    id: `${accessCode.code}-${Date.now()}`,
    maxUses: Number.isInteger(maxUses) && maxUses > 0 ? maxUses : 1,
    residentId: accessCode.residentId ?? resident?.id ?? "",
    residentName: resident?.fullName ?? "Residente selecionado",
  };
}

function filterResidents(residents, searchTerm) {
  const query = normalizeText(searchTerm);

  if (!query) {
    return residents;
  }

  return residents.filter((resident) => {
    const searchableContent = [
      resident.fullName,
      resident.gender,
      resident.bloodType,
      resident.status,
    ]
      .map(normalizeText)
      .join(" ");

    return matchesSearch([searchableContent], query);
  });
}

function isActiveResident(resident) {
  const status = normalizeText(resident.status);

  return status === "active" || status === "ativo";
}
