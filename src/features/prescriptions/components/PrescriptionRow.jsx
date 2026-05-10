import {
  formatDateRange,
  formatDateTime,
} from "@/shared/utils/dateFormatter";
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
      <span className={`dashboard-status-badge is-${status.tone}`}>
        {status.label}
      </span>

      <span className="prescription-row-main">
        <strong>{prescription.resident?.fullName ?? "Residente"}</strong>
        <span>{getMedicationName(prescription.medication)}</span>
      </span>

      <span className="prescription-row-meta">
        <strong>{formatPrescriptionDosage(prescription)}</strong>
        <span>{prescription.frequency}</span>
      </span>

      <span className="prescription-row-schedule">
        <strong>{formatDateTime(prescription.firstScheduledAt)}</strong>
        <span>{formatDateRange(prescription.startDate, prescription.endDate)}</span>
      </span>
    </button>
  );
}
