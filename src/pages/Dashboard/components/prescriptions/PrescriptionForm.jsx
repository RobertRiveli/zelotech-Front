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

  return (
    <form className="prescription-form" onSubmit={onSubmit}>
      {submitError ? (
        <div className="prescription-form-alert" role="status">
          {submitError}
        </div>
      ) : null}

      <div className="prescription-form-grid">
        <label className="prescription-field">
          <span>Residente</span>
          <select
            disabled={isSubmitting || isLoadingAuxiliaryData}
            name="residentId"
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

        <label className="prescription-field">
          <span>Medicamento</span>
          <select
            disabled={isSubmitting || isLoadingAuxiliaryData}
            name="medicationId"
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
          <FieldError message={errors.medicationId || errors.medication} />
        </label>

        <label className="prescription-field">
          <span>Unidade</span>
          <select
            disabled={isSubmitting || isLoadingAuxiliaryData}
            name="measurementUnitId"
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
          <FieldError message={errors.measurementUnitId || errors.measurementUnit} />
        </label>

        <label className="prescription-field">
          <span>Dosagem</span>
          <input
            name="dosage"
            placeholder="500"
            value={form.dosage}
            onChange={onChange}
          />
          <FieldError message={errors.dosage} />
        </label>

        <label className="prescription-field">
          <span>Via</span>
          <input
            list="prescription-route-options"
            name="route"
            placeholder="oral"
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

        <label className="prescription-field">
          <span>Frequência</span>
          <input
            list="prescription-frequency-options"
            name="frequency"
            placeholder="a cada 8 horas"
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

        <label className="prescription-field">
          <span>Intervalo em horas</span>
          <input
            min="1"
            name="intervalHours"
            type="number"
            value={form.intervalHours}
            onChange={onChange}
          />
          <FieldError message={errors.intervalHours} />
        </label>

        <label className="prescription-field">
          <span>Primeira data</span>
          <input
            name="firstScheduledDate"
            type="date"
            value={form.firstScheduledDate}
            onChange={onChange}
          />
          <FieldError message={errors.firstScheduledAt} />
        </label>

        <label className="prescription-field">
          <span>Primeiro horário</span>
          <input
            name="firstScheduledTime"
            type="time"
            value={form.firstScheduledTime}
            onChange={onChange}
          />
        </label>

        <label className="prescription-field">
          <span>Data inicial</span>
          <input
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={onChange}
          />
          <FieldError message={errors.startDate} />
        </label>

        <label className="prescription-field">
          <span>Data final</span>
          <input
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={onChange}
          />
          <FieldError message={errors.endDate} />
        </label>

        <label className="prescription-field">
          <span>Prescritor</span>
          <input
            name="prescribedBy"
            placeholder="Dr. Carlos Mendes"
            value={form.prescribedBy}
            onChange={onChange}
          />
          <FieldError message={errors.prescribedBy} />
        </label>
      </div>

      {isEditing ? (
        <div className="prescription-context-note" role="note">
          Alterações na prescrição não recalculam administrações já criadas.
        </div>
      ) : null}

      <div className="prescription-form-actions">
        <button
          className="prescription-button prescription-button-muted"
          disabled={isSubmitting}
          type="button"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          className="prescription-button prescription-button-primary"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Salvando..." : "Salvar prescrição"}
        </button>
      </div>
    </form>
  );
}

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <small className="prescription-field-error">{message}</small>;
}

function formatMedicationOption(medication) {
  const brandName = medication.brandName ? ` (${medication.brandName})` : "";
  const strength = medication.strength ? ` - ${medication.strength}` : "";

  return `${medication.genericName}${brandName}${strength}`;
}
