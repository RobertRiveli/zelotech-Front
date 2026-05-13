import { useEffect } from "react";
import { formatShortDateTime } from "@/shared/utils/dateFormatter";
import { FieldError } from "@/shared/ui/FieldError";

export function ResidentAccessCodeModal({
  copyFeedback,
  error,
  fieldErrors,
  form,
  generatedAccess,
  isGenerating,
  onChange,
  onClose,
  onCopy,
  onSubmit,
  resident,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && !isGenerating) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGenerating, onClose]);

  if (!resident) {
    return null;
  }

  return (
    <div className="resident-modal-layer">
      <button
        aria-label="Fechar geração de código"
        className="resident-modal-scrim"
        disabled={isGenerating}
        type="button"
        onClick={onClose}
      />

      <section
        aria-labelledby="resident-access-title"
        aria-modal="true"
        className="resident-modal"
        role="dialog"
      >
        <header className="resident-modal-header">
          <div>
            <span className="overline">Acesso familiar</span>
            <h2 id="resident-access-title">Gerar código</h2>
          </div>
          <button
            className="dashboard-button dashboard-button-muted"
            disabled={isGenerating}
            type="button"
            onClick={onClose}
          >
            Fechar
          </button>
        </header>

        <form className="resident-modal-body" onSubmit={onSubmit}>
          {error ? (
            <div
              className="dashboard-form-alert dashboard-form-alert-danger"
              role="status"
            >
              {error}
            </div>
          ) : null}

          {copyFeedback ? (
            <div
              className="dashboard-form-alert dashboard-form-alert-success"
              role="status"
            >
              {copyFeedback}
            </div>
          ) : null}

          {generatedAccess ? (
            <div className="resident-access-code-card">
              <span>Compartilhe este código com o familiar</span>
              <strong>{generatedAccess.code}</strong>
              <div className="resident-access-code-meta">
                <span>{resident.fullName}</span>
                <span>Expira em {formatShortDateTime(generatedAccess.expiresAt)}</span>
                <span>
                  {generatedAccess.maxUses} uso
                  {generatedAccess.maxUses === 1 ? "" : "s"}
                </span>
              </div>
              <button
                className="dashboard-button dashboard-button-primary"
                type="button"
                onClick={() => onCopy(generatedAccess.code)}
              >
                Copiar código
              </button>
            </div>
          ) : (
            <>
              <p className="resident-delete-copy">
                O código será criado para {resident.fullName} e deve ser
                compartilhado pelo canal definido pela instituição.
              </p>

              <label className="dashboard-field">
                <span>Limite de usos</span>
                <input
                  min="1"
                  name="maxUses"
                  type="number"
                  value={form.maxUses}
                  onChange={onChange}
                />
                <FieldError message={fieldErrors.maxUses} />
              </label>
            </>
          )}
        </form>

        <footer className="resident-modal-footer">
          <button
            className="dashboard-button dashboard-button-muted"
            disabled={isGenerating}
            type="button"
            onClick={onClose}
          >
            {generatedAccess ? "Concluir" : "Cancelar"}
          </button>
          {!generatedAccess ? (
            <button
              className="dashboard-button dashboard-button-primary"
              disabled={isGenerating}
              type="button"
              onClick={onSubmit}
            >
              {isGenerating ? "Gerando..." : "Gerar código"}
            </button>
          ) : null}
        </footer>
      </section>
    </div>
  );
}
