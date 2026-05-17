import { useEffect } from "react";
import { formatShortDateTime } from "@/shared/utils/dateFormatter";
import { formatMedicationForm } from "@/features/medications/utils/medicationDashboardUtils";
import { getMedicationName } from "@/features/medications/utils/medicationFormatters";

export function MedicationDeleteModal({
  isMutating,
  medication,
  onClose,
  onConfirm,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && !isMutating) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMutating, onClose]);

  return (
    <div className="medication-modal-layer">
      <button
        aria-label="Fechar confirmação"
        className="medication-modal-scrim"
        disabled={isMutating}
        type="button"
        onClick={onClose}
      />

      <section
        aria-describedby="medication-delete-description"
        aria-labelledby="medication-delete-title"
        aria-modal="true"
        className="medication-modal medication-delete-modal"
        role="dialog"
      >
        <header className="medication-modal-header">
          <div>
            <span className="overline">Exclusão lógica</span>
            <h2 id="medication-delete-title">Remover medicamento</h2>
          </div>
          <button
            className="dashboard-button dashboard-button-muted"
            disabled={isMutating}
            type="button"
            onClick={onClose}
          >
            Fechar
          </button>
        </header>

        <div className="medication-modal-body">
          <p
            className="medication-delete-copy"
            id="medication-delete-description"
          >
            Confirme se este é o medicamento correto. A exclusão é lógica: ele
            deixará de aparecer na listagem, mas o histórico permanece
            preservado.
          </p>

          <div className="medication-delete-summary">
            <div>
              <span>Medicamento</span>
              <strong>{getMedicationName(medication)}</strong>
            </div>
            <div>
              <span>Forma</span>
              <strong>{formatMedicationForm(medication.form)}</strong>
            </div>
            <div>
              <span>Dosagem</span>
              <strong>{medication.strength || "Não informado"}</strong>
            </div>
            <div>
              <span>Atualizado em</span>
              <strong>{formatShortDateTime(medication.updatedAt)}</strong>
            </div>
          </div>
        </div>

        <footer className="medication-modal-footer">
          <button
            className="dashboard-button dashboard-button-muted"
            disabled={isMutating}
            type="button"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="dashboard-button dashboard-button-danger"
            disabled={isMutating}
            type="button"
            onClick={onConfirm}
          >
            {isMutating ? "Removendo..." : "Remover medicamento"}
          </button>
        </footer>
      </section>
    </div>
  );
}
