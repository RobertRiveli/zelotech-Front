import { FieldError } from "@/shared/ui/FieldError";
import { AdministrationModalShell } from "./AdministrationModalShell";
import { getMedicationName } from "@/features/medications/utils/medicationFormatters";

export function ManualAdministrationModal({
  errors,
  form,
  isSubmitting,
  onChange,
  onClose,
  onSubmit,
  prescriptions,
  residents,
  submitError,
}) {
  const visiblePrescriptions = getVisiblePrescriptions(prescriptions, form.residentId);

  return (
    <AdministrationModalShell
      overline="Dose avulsa"
      title="Administração manual"
      onClose={onClose}
    >
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
            <span>Residente</span>
            <select name="residentId" value={form.residentId} onChange={onChange}>
              <option value="">Selecione</option>
              {residents.map((resident) => (
                <option key={resident.id} value={resident.id}>
                  {resident.fullName}
                </option>
              ))}
            </select>
            <FieldError message={errors.residentId} />
          </label>

          <label className="dashboard-field">
            <span>Prescrição</span>
            <select
              name="prescriptionId"
              value={form.prescriptionId}
              onChange={onChange}
            >
              <option value="">Selecione</option>
              {visiblePrescriptions.map((prescription) => (
                <option key={prescription.id} value={prescription.id}>
                  {formatPrescriptionOption(prescription)}
                </option>
              ))}
            </select>
            <FieldError message={errors.prescriptionId} />
          </label>

          <label className="dashboard-field">
            <span>Horário previsto</span>
            <input
              name="scheduledAt"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={onChange}
            />
            <FieldError message={errors.scheduledAt} />
          </label>
        </div>

        <label className="dashboard-field">
          <span>Observações</span>
          <textarea
            name="notes"
            placeholder="Exemplo: dose avulsa autorizada pelo administrador."
            rows="4"
            value={form.notes}
            onChange={onChange}
          />
          <FieldError message={errors.notes} />
        </label>

        <div className="dashboard-context-note" role="note">
          Use administração manual apenas para dose avulsa, correção ou exceção
          administrativa.
        </div>

        <div className="dashboard-form-actions">
          <button
            className="dashboard-button dashboard-button-muted"
            disabled={isSubmitting}
            type="button"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="dashboard-button dashboard-button-primary"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Salvando..." : "Criar administração"}
          </button>
        </div>
      </form>
    </AdministrationModalShell>
  );
}

function getVisiblePrescriptions(prescriptions, residentId) {
  if (!residentId) {
    return prescriptions;
  }

  return prescriptions.filter(
    (prescription) =>
      prescription.resident?.id === residentId ||
      prescription.residentId === residentId,
  );
}

function formatPrescriptionOption(prescription) {
  const medication = getMedicationName(prescription.medication);
  const dosage = [
    prescription.dosage,
    prescription.measurementUnit?.abbreviation,
  ]
    .filter(Boolean)
    .join(" ");

  return [medication, dosage, prescription.frequency].filter(Boolean).join(" - ");
}
