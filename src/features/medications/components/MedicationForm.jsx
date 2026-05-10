import { medicationFormOptions } from "@/features/medications/constants/medicationForms";
import { FieldError } from "@/shared/ui/FieldError";

export function MedicationForm({
  errors,
  form,
  isSubmitting,
  mode,
  onCancel,
  onChange,
  onSubmit,
  submitError,
}) {
  const isEditing = mode === "edit";

  return (
    <form className="dashboard-form" onSubmit={onSubmit}>
      {submitError ? (
        <div
          className="dashboard-form-alert dashboard-form-alert-danger"
          role="status"
        >
          {submitError}
        </div>
      ) : null}

      <div className="dashboard-form-grid">
        <label className="dashboard-field">
          <span>Nome genérico</span>
          <input
            name="genericName"
            placeholder="Paracetamol"
            value={form.genericName}
            onChange={onChange}
          />
          <FieldError message={errors.genericName || errors.medication} />
        </label>

        <label className="dashboard-field">
          <span>Marca comercial</span>
          <input
            name="brandName"
            placeholder="Tylenol"
            value={form.brandName}
            onChange={onChange}
          />
          <FieldError message={errors.brandName} />
        </label>

        <label className="dashboard-field">
          <span>Forma</span>
          <input
            list="medication-form-options"
            name="form"
            placeholder="comprimido"
            value={form.form}
            onChange={onChange}
          />
          <datalist id="medication-form-options">
            {medicationFormOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
          <FieldError message={errors.form} />
        </label>

        <label className="dashboard-field">
          <span>Dosagem/concentração</span>
          <input
            name="strength"
            placeholder="500mg"
            value={form.strength}
            onChange={onChange}
          />
          <FieldError message={errors.strength} />
        </label>
      </div>

      <div className="dashboard-form-actions">
        <button
          className="dashboard-button dashboard-button-muted"
          disabled={isSubmitting}
          type="button"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          className="dashboard-button dashboard-button-primary"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Salvando..." : "Salvar medicamento"}
        </button>
      </div>
    </form>
  );
}
