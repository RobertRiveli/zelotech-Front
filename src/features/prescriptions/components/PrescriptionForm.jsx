import { FieldError } from "@/shared/ui/FieldError";

const routeOptions = [
  "oral",
  "sublingual",
  "topica",
  "inalatoria",
  "intravenosa",
  "intramuscular",
  "oftalmica",
  "auricular",
];

const frequencyOptions = [
  "a cada 4 horas",
  "a cada 6 horas",
  "a cada 8 horas",
  "a cada 12 horas",
  "1 vez ao dia",
  "2 vezes ao dia",
];

export function PrescriptionForm({
  errors,
  form,
  isLoadingAuxiliaryData,
  isSubmitting,
  medications,
  mode,
  onCancel,
  onChange,
  onSubmit,
  residents,
  submitError,
  units,
}) {
  const isEditing = mode === "edit";
  let submitLabel = isEditing ? "Salvar alterações" : "Salvar prescrição";

  if (isSubmitting) {
    submitLabel = "Salvando...";
  }

  return (
    <form className="dashboard-form" noValidate onSubmit={onSubmit}>
      {submitError ? (
        <div
          className="dashboard-form-alert dashboard-form-alert-danger"
          role="status"
        >
          {submitError}
        </div>
      ) : null}

      <div className="dashboard-form-grid">
        <label
          className={`dashboard-field${
            errors.residentId || errors.resident ? " has-error" : ""
          }`}
        >
          <span>Residente</span>
          <select
            aria-invalid={Boolean(errors.residentId || errors.resident)}
            disabled={isSubmitting || isLoadingAuxiliaryData}
            name="residentId"
            required
            value={form.residentId}
            onChange={onChange}
          >
            <option value="">Selecione</option>
            {residents.map((resident) => (
              <option key={resident.id} value={resident.id}>
                {resident.fullName}
              </option>
            ))}
          </select>
          <FieldError message={errors.residentId || errors.resident} />
        </label>

        <label
          className={`dashboard-field${
            errors.medicationId || errors.medication ? " has-error" : ""
          }`}
        >
          <span>Medicamento</span>
          <select
            aria-invalid={Boolean(errors.medicationId || errors.medication)}
            disabled={isSubmitting || isLoadingAuxiliaryData}
            name="medicationId"
            required
            value={form.medicationId}
            onChange={onChange}
          >
            <option value="">Selecione</option>
            {medications.map((medication) => (
              <option key={medication.id} value={medication.id}>
                {formatMedicationOption(medication)}
              </option>
            ))}
          </select>
          <FieldError
            message={errors.medicationId || errors.medication}
          />
        </label>

        <label
          className={`dashboard-field${
            errors.measurementUnitId || errors.measurementUnit ? " has-error" : ""
          }`}
        >
          <span>Unidade</span>
          <select
            aria-invalid={Boolean(
              errors.measurementUnitId || errors.measurementUnit,
            )}
            disabled={isSubmitting || isLoadingAuxiliaryData}
            name="measurementUnitId"
            required
            value={form.measurementUnitId}
            onChange={onChange}
          >
            <option value="">Selecione</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.abbreviation})
              </option>
            ))}
          </select>
          <FieldError
            message={errors.measurementUnitId || errors.measurementUnit}
          />
        </label>

        <label className={`dashboard-field${errors.dosage ? " has-error" : ""}`}>
          <span>Dosagem</span>
          <input
            aria-invalid={Boolean(errors.dosage)}
            name="dosage"
            placeholder="500"
            required
            value={form.dosage}
            onChange={onChange}
          />
          <FieldError message={errors.dosage} />
        </label>

        <label className={`dashboard-field${errors.route ? " has-error" : ""}`}>
          <span>Via</span>
          <input
            aria-invalid={Boolean(errors.route)}
            list="prescription-route-options"
            name="route"
            placeholder="oral"
            required
            value={form.route}
            onChange={onChange}
          />
          <datalist id="prescription-route-options">
            {routeOptions.map((route) => (
              <option key={route} value={route} />
            ))}
          </datalist>
          <FieldError message={errors.route} />
        </label>

        <label
          className={`dashboard-field${errors.frequency ? " has-error" : ""}`}
        >
          <span>Frequência</span>
          <input
            aria-invalid={Boolean(errors.frequency)}
            list="prescription-frequency-options"
            name="frequency"
            placeholder="a cada 8 horas"
            required
            value={form.frequency}
            onChange={onChange}
          />
          <datalist id="prescription-frequency-options">
            {frequencyOptions.map((frequency) => (
              <option key={frequency} value={frequency} />
            ))}
          </datalist>
          <FieldError message={errors.frequency} />
        </label>

        <label
          className={`dashboard-field${errors.intervalHours ? " has-error" : ""}`}
        >
          <span>Intervalo em horas</span>
          <input
            aria-invalid={Boolean(errors.intervalHours)}
            min="1"
            name="intervalHours"
            required
            type="number"
            value={form.intervalHours}
            onChange={onChange}
          />
          <FieldError message={errors.intervalHours} />
        </label>

        <label
          className={`dashboard-field${
            errors.firstScheduledAt ? " has-error" : ""
          }`}
        >
          <span>Primeira data</span>
          <input
            aria-invalid={Boolean(errors.firstScheduledAt)}
            name="firstScheduledDate"
            required
            type="date"
            value={form.firstScheduledDate}
            onChange={onChange}
          />
          <FieldError message={errors.firstScheduledAt} />
        </label>

        <label
          className={`dashboard-field${
            errors.firstScheduledAt ? " has-error" : ""
          }`}
        >
          <span>Primeiro horário</span>
          <input
            aria-invalid={Boolean(errors.firstScheduledAt)}
            name="firstScheduledTime"
            required
            type="time"
            value={form.firstScheduledTime}
            onChange={onChange}
          />
        </label>

        <label
          className={`dashboard-field${errors.startDate ? " has-error" : ""}`}
        >
          <span>Data inicial</span>
          <input
            aria-invalid={Boolean(errors.startDate)}
            name="startDate"
            required
            type="date"
            value={form.startDate}
            onChange={onChange}
          />
          <FieldError message={errors.startDate} />
        </label>

        <label className={`dashboard-field${errors.endDate ? " has-error" : ""}`}>
          <span>Data final</span>
          <input
            aria-invalid={Boolean(errors.endDate)}
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={onChange}
          />
          <FieldError message={errors.endDate} />
        </label>

        <label
          className={`dashboard-field${errors.prescribedBy ? " has-error" : ""}`}
        >
          <span>Prescritor</span>
          <input
            aria-invalid={Boolean(errors.prescribedBy)}
            name="prescribedBy"
            placeholder="Dr. Carlos Mendes"
            required
            value={form.prescribedBy}
            onChange={onChange}
          />
          <FieldError message={errors.prescribedBy} />
        </label>
      </div>

      {isEditing ? (
        <div className="dashboard-context-note" role="note">
          Alterações na prescrição não recalculam administrações já criadas.
        </div>
      ) : null}

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

function formatMedicationOption(medication) {
  const brandName = medication.brandName ? ` (${medication.brandName})` : "";
  const strength = medication.strength ? ` - ${medication.strength}` : "";

  return `${medication.genericName}${brandName}${strength}`;
}
