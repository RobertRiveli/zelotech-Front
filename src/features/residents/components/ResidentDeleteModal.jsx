import { useEffect } from "react";
import { formatShortDate } from "@/shared/utils/dateFormatter";
import {
  getResidentStatusLabel,
} from "@/features/residents/utils/residentFormatters";

export function ResidentDeleteModal({
  error,
  isDeleting,
  onClose,
  onConfirm,
  resident,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && !isDeleting) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDeleting, onClose]);

  if (!resident) {
    return null;
  }

  return (
    <div className="resident-modal-layer">
      <button
        aria-label="Fechar confirmação"
        className="resident-modal-scrim"
        disabled={isDeleting}
        type="button"
        onClick={onClose}
      />

      <section
        aria-describedby="resident-delete-description"
        aria-labelledby="resident-delete-title"
        aria-modal="true"
        className="resident-modal"
        role="dialog"
      >
        <header className="resident-modal-header">
          <div>
            <span className="overline">Exclusão</span>
            <h2 id="resident-delete-title">Excluir residente</h2>
          </div>
          <button
            className="dashboard-button dashboard-button-muted"
            disabled={isDeleting}
            type="button"
            onClick={onClose}
          >
            Fechar
          </button>
        </header>

        <div className="resident-modal-body">
          {error ? (
            <div
              className="dashboard-form-alert dashboard-form-alert-danger"
              role="status"
            >
              {error}
            </div>
          ) : null}

          <p className="resident-delete-copy" id="resident-delete-description">
            Confirme se este é o residente correto. O registro será desativado e
            deixará de aparecer na listagem de residentes ativos.
          </p>

          <div className="resident-delete-summary">
            <div>
              <span>Residente</span>
              <strong>{resident.fullName}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{getResidentStatusLabel(resident.status)}</strong>
            </div>
            <div>
              <span>Nascimento</span>
              <strong>{formatShortDate(resident.birthDate)}</strong>
            </div>
            <div>
              <span>Admissão</span>
              <strong>{formatShortDate(resident.admissionDate)}</strong>
            </div>
          </div>
        </div>

        <footer className="resident-modal-footer">
          <button
            className="dashboard-button dashboard-button-muted"
            disabled={isDeleting}
            type="button"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="dashboard-button dashboard-button-danger"
            disabled={isDeleting}
            type="button"
            onClick={onConfirm}
          >
            {isDeleting ? "Excluindo..." : "Excluir residente"}
          </button>
        </footer>
      </section>
    </div>
  );
}
