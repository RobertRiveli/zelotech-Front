import { useEffect } from "react";
import {
  formatDateRange,
  formatDateTime,
} from "@/shared/utils/dateFormatter";
import { getMedicationName } from "@/features/medications/utils/medicationFormatters";
import { formatPrescriptionDosage } from "@/features/prescriptions/utils/prescriptionFormatters";

export function PrescriptionDeactivateModal({
  isMutating,
  onClose,
  onConfirm,
  prescription,
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

  const residentName = prescription.resident?.fullName ?? "Residente";
  const medicationName = getMedicationName(prescription.medication);

  return (
    <div className="prescription-modal-layer">
      <button
        aria-label="Fechar confirmação"
        className="prescription-modal-scrim"
        disabled={isMutating}
        type="button"
        onClick={onClose}
      />

      <section
        aria-describedby="prescription-deactivate-description"
        aria-labelledby="prescription-deactivate-title"
        aria-modal="true"
        className="prescription-modal"
        role="dialog"
      >
        <header className="prescription-modal-header">
          <div>
            <span className="overline">Desativação</span>
            <h2 id="prescription-deactivate-title">Desativar prescrição</h2>
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

        <div className="prescription-modal-body">
          <p
            className="prescription-deactivate-copy"
            id="prescription-deactivate-description"
          >
            Confirme se esta é a prescrição correta. Ela deixará de aparecer
            como ativa após a desativação.
          </p>

          <div className="prescription-deactivate-summary">
            <div>
              <span>Residente</span>
              <strong>{residentName}</strong>
            </div>
            <div>
              <span>Medicamento</span>
              <strong>{medicationName}</strong>
            </div>
            <div>
              <span>Dose</span>
              <strong>{formatPrescriptionDosage(prescription)}</strong>
            </div>
            <div>
              <span>Agenda</span>
              <strong>{formatDateTime(prescription.firstScheduledAt)}</strong>
            </div>
            <div>
              <span>Período</span>
              <strong>
                {formatDateRange(prescription.startDate, prescription.endDate)}
              </strong>
            </div>
            <div>
              <span>Prescritor</span>
              <strong>{prescription.prescribedBy || "Não informado"}</strong>
            </div>
          </div>
        </div>

        <footer className="prescription-modal-footer">
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
            {isMutating ? "Desativando..." : "Desativar prescrição"}
          </button>
        </footer>
      </section>
    </div>
  );
}
