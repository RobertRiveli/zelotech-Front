import { medicationFormOptions } from "@/features/medications/constants/medicationForms";
import { formatMedicationForm } from "@/features/medications/utils/medicationDashboardUtils";
import { FieldError } from "@/shared/ui/FieldError";

export function MedicationForm({
  duplicateWarning,
  errors,
  form,
  isSubmitting,
  mode,
  onCancel,
  onChange,
  onSubmit,
  submitError,
}) {
  const medicationError = errors.medication || errors.role;
  let submitLabel = mode === "edit" ? "Salvar alterações" : "Salvar medicamento";

  if (isSubmitting) {
    submitLabel = "Salvando...";
  }

  return (
    <form className="dashboard-form" noValidate onSubmit={onSubmit}>
      {submitError || medicationError ? (
        <div
          className="dashboard-form-alert dashboard-form-alert-danger"
          role="status"
        >
          {medicationError || submitError}
        </div>
      ) : null}

      {duplicateWarning && !medicationError ? (
        <div
          className="dashboard-form-alert medication-form-alert-warning"
          role="status"
        >
          {duplicateWarning}
        </div>
      ) : null}

      <div className="dashboard-form-grid">
        <label
          className={`dashboard-field${errors.genericName ? " has-error" : ""}`}
        >
          <span>Nome genérico *</span>
          <input
            aria-invalid={Boolean(errors.genericName)}
            autoComplete="off"
            maxLength={120}
            name="genericName"
            placeholder="Paracetamol"
            required
            value={form.genericName}
            onChange={onChange}
          />
          <FieldError message={errors.genericName} />
        </label>

        <label
          className={`dashboard-field${errors.brandName ? " has-error" : ""}`}
        >
          <span>Marca comercial</span>
          <input
            aria-invalid={Boolean(errors.brandName)}
            autoComplete="off"
            maxLength={120}
            name="brandName"
            placeholder="Tylenol"
            value={form.brandName}
            onChange={onChange}
          />
          <FieldError message={errors.brandName} />
        </label>

        <label className={`dashboard-field${errors.form ? " has-error" : ""}`}>
          <span>Forma *</span>
          <select
            aria-invalid={Boolean(errors.form)}
            name="form"
            required
            value={form.form}
            onChange={onChange}
          >
            <option value="">Selecione</option>
            {medicationFormOptions.map((option) => (
              <option key={option} value={option}>
                {formatMedicationForm(option)}
              </option>
            ))}
          </select>
          <FieldError message={errors.form} />
        </label>

        <label
          className={`dashboard-field${errors.strength ? " has-error" : ""}`}
        >
          <span>Dosagem/concentração</span>
          <input
            aria-invalid={Boolean(errors.strength)}
            autoComplete="off"
            maxLength={80}
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
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
