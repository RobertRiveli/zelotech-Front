import { getMedicationName } from "@/features/medications/utils/medicationFormatters";
import { formatPrescriptionDosage } from "@/features/prescriptions/utils/prescriptionFormatters";
import { getPrescriptionStatus } from "@/features/prescriptions/utils/prescriptionDashboardUtils";

export function PrescriptionRow({
  currentTime,
  isSelected,
  onSelect,
  prescription,
}) {
  const status = getPrescriptionStatus(prescription, currentTime);

  return (
    <button
      className={`prescription-row${isSelected ? " is-selected" : ""}`}
      type="button"
      onClick={() => onSelect(prescription)}
    >
      <span className="prescription-row-status">
        <span className="prescription-row-label">Status</span>
        <span className={`dashboard-status-badge is-${status.tone}`}>
          {status.label}
        </span>
      </span>

      <span className="prescription-row-main">
        <span className="prescription-row-label">Residente e medicamento</span>
        <strong>{prescription.resident?.fullName ?? "Residente"}</strong>
        <span>{getMedicationName(prescription.medication)}</span>
      </span>

      <span className="prescription-row-meta">
        <span className="prescription-row-label">Dose e frequência</span>
        <strong>{formatPrescriptionDosage(prescription)}</strong>
        <span>{prescription.frequency}</span>
      </span>
    </button>
  );
}
