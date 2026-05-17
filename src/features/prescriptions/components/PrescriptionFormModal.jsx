import { useEffect } from "react";
import { PrescriptionForm } from "./PrescriptionForm";

export function PrescriptionFormModal({
  errors,
  form,
  isLoadingAuxiliaryData,
  isSubmitting,
  medications,
  mode,
  onChange,
  onClose,
  onSubmit,
  residents,
  submitError,
  units,
  unitsError,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onClose]);

  const isEditing = mode === "edit";
  const title = isEditing ? "Editar prescrição" : "Nova prescrição";

  return (
    <div className="prescription-modal-layer">
      <button
        aria-label="Fechar cadastro de prescrição"
        className="prescription-modal-scrim"
        disabled={isSubmitting}
        type="button"
        onClick={onClose}
      />

      <section
        aria-labelledby="prescription-form-modal-title"
        aria-modal="true"
        className="prescription-modal prescription-form-modal"
        role="dialog"
      >
        <header className="prescription-modal-header">
          <div>
            <span className="overline">{isEditing ? "Edição" : "Cadastro"}</span>
            <h2 id="prescription-form-modal-title">{title}</h2>
          </div>
          <button
            className="dashboard-button dashboard-button-muted"
            disabled={isSubmitting}
            type="button"
            onClick={onClose}
          >
            Fechar
          </button>
        </header>

        <div className="prescription-modal-body">
          {unitsError ? (
            <div className="resident-inline-alert" role="status">
              {unitsError}
            </div>
          ) : null}

          <PrescriptionForm
            errors={errors}
            form={form}
            isLoadingAuxiliaryData={isLoadingAuxiliaryData}
            isSubmitting={isSubmitting}
            medications={medications}
            mode={mode}
            residents={residents}
            submitError={submitError}
            units={units}
            onCancel={onClose}
            onChange={onChange}
            onSubmit={onSubmit}
          />
        </div>
      </section>
    </div>
  );
}
