import {
  formatDateRange,
  formatPrescriptionDosage,
  formatShortDate,
  formatTime,
  getMedicationName,
} from "../../utils/dashboardFormatters";
import { getPrescriptionStatus } from "../../utils/prescriptionDashboardUtils";

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
        <strong>{formatFirstSchedule(prescription.firstScheduledAt)}</strong>
        <span>{formatDateRange(prescription.startDate, prescription.endDate)}</span>
      </span>
    </button>
  );
}

function formatFirstSchedule(value) {
  if (!value) {
    return "Sem horário";
  }

  return `${formatShortDate(value)} às ${formatTime(value)}`;
}
