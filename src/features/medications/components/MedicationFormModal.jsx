import { useEffect } from "react";
import { MedicationForm } from "./MedicationForm";

export function MedicationFormModal({
  duplicateWarning,
  errors,
  form,
  isSubmitting,
  mode,
  onChange,
  onClose,
  onSubmit,
  submitError,
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
  const title = isEditing ? "Editar medicamento" : "Cadastrar medicamento";

  return (
    <div className="medication-modal-layer">
      <button
        aria-label="Fechar cadastro de medicamento"
        className="medication-modal-scrim"
        disabled={isSubmitting}
        type="button"
        onClick={onClose}
      />

      <section
        aria-labelledby="medication-form-modal-title"
        aria-modal="true"
        className="medication-modal"
        role="dialog"
      >
        <header className="medication-modal-header">
          <div>
            <span className="overline">{isEditing ? "Edição" : "Cadastro"}</span>
            <h2 id="medication-form-modal-title">{title}</h2>
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

        <div className="medication-modal-body">
          <MedicationForm
            duplicateWarning={duplicateWarning}
            errors={errors}
            form={form}
            isSubmitting={isSubmitting}
            mode={mode}
            submitError={submitError}
            onCancel={onClose}
            onChange={onChange}
            onSubmit={onSubmit}
          />
        </div>
      </section>
    </div>
  );
}
