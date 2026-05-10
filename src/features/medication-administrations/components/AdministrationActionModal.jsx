import { FieldError } from "@/shared/ui/FieldError";
import { AdministrationModalShell } from "./AdministrationModalShell";
import { administrationReasonSuggestions } from "@/features/medication-administrations/constants/administrationReasonSuggestions";
import { getMedicationName } from "@/features/medications/utils/medicationFormatters";

const actionContent = {
  administer: {
    overline: "Administração",
    submitLabel: "Confirmar administração",
    title: "Marcar como administrada",
  },
  cancel: {
    overline: "Cancelamento",
    reasonLabel: "Justificativa do cancelamento",
    reasonPlaceholder: "Prescrição suspensa pelo médico.",
    submitLabel: "Cancelar administração",
    title: "Cancelar administração",
  },
  miss: {
    overline: "Perda",
    reasonLabel: "Justificativa da perda",
    reasonPlaceholder: "Medicamento indisponível ou impossibilidade operacional.",
    submitLabel: "Marcar como perdida",
    title: "Registrar perda",
  },
  refuse: {
    overline: "Recusa",
    reasonLabel: "Justificativa da recusa",
    reasonPlaceholder: "Residente recusou o medicamento.",
    submitLabel: "Marcar como recusada",
    title: "Registrar recusa",
  },
};

export function AdministrationActionModal({
  actionType,
  administration,
  errors,
  form,
  isSubmitting,
  onChange,
  onClose,
  onReasonSelect,
  onSubmit,
  submitError,
}) {
  const content = actionContent[actionType];
  const reasonSuggestions = administrationReasonSuggestions[actionType] ?? [];

  if (!content || !administration) {
    return null;
  }

  return (
    <AdministrationModalShell
      overline={content.overline}
      title={content.title}
      onClose={onClose}
    >
      <form className="dashboard-form" onSubmit={onSubmit}>
        {submitError ? (
          <div
            className="dashboard-form-alert dashboard-form-alert-danger"
            role="status"
          >
            {submitError}
          </div>
        ) : null}

        <div className="administration-action-summary">
          <strong>{administration.resident?.fullName ?? "Residente"}</strong>
          <span>{getMedicationName(administration.medication)}</span>
        </div>

        {actionType === "administer" ? (
          <label className="dashboard-field">
            <span>Horário administrado</span>
            <input
              name="administeredAt"
              inputMode="numeric"
              placeholder="10/05/2026 14:30"
              type="text"
              value={form.administeredAt}
              onChange={onChange}
            />
            <small className="administration-field-hint">
              Ajuste apenas se a administração ocorreu em outro horário.
            </small>
            <FieldError message={errors.administeredAt} />
          </label>
        ) : (
          <div className="administration-reason-field">
            <label className="dashboard-field">
              <span>{content.reasonLabel}</span>
              <textarea
                name="reason"
                placeholder={content.reasonPlaceholder}
                rows="4"
                value={form.reason}
                onChange={onChange}
              />
              <FieldError message={errors.reason} />
            </label>

            {reasonSuggestions.length > 0 ? (
              <div
                className="administration-reason-suggestions"
                aria-label="Motivos rápidos"
              >
                <span>Motivos rápidos</span>
                <div>
                  {reasonSuggestions.map((suggestion) => (
                    <button
                      className={`administration-reason-chip${
                        form.reason === suggestion ? " is-selected" : ""
                      }`}
                      disabled={isSubmitting}
                      key={suggestion}
                      type="button"
                      onClick={() => onReasonSelect(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        <label className="dashboard-field">
          <span>Observações</span>
          <textarea
            name="notes"
            placeholder="Registre uma observação complementar, se necessário."
            rows="4"
            value={form.notes}
            onChange={onChange}
          />
          <FieldError message={errors.notes} />
        </label>

        <div className="dashboard-form-actions">
          <button
            className="dashboard-button dashboard-button-muted"
            disabled={isSubmitting}
            type="button"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className={
              actionType === "cancel"
                ? "dashboard-button dashboard-button-danger"
                : "dashboard-button dashboard-button-primary"
            }
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Salvando..." : content.submitLabel}
          </button>
        </div>
      </form>
    </AdministrationModalShell>
  );
}
