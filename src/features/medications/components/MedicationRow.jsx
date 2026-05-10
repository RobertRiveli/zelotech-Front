import { formatShortDate } from "@/shared/utils/dateFormatter";
import {
  formatMedicationForm,
} from "@/features/medications/utils/medicationDashboardUtils";
import { getMedicationName } from "@/features/medications/utils/medicationFormatters";

export function MedicationRow({ isSelected, medication, onSelect }) {
  return (
    <button
      className={`medication-row${isSelected ? " is-selected" : ""}`}
      type="button"
      onClick={() => onSelect(medication)}
    >
      <span className="dashboard-status-badge is-muted">
        {formatMedicationForm(medication.form)}
      </span>

      <span className="medication-row-main">
        <strong>{medication.genericName}</strong>
        <span>{medication.brandName || "Sem marca comercial"}</span>
      </span>

      <span className="medication-row-meta">
        <strong>{medication.strength || "Sem dosagem"}</strong>
        <span>{getMedicationName(medication)}</span>
      </span>

      <span className="medication-row-date">
        <strong>{formatShortDate(medication.updatedAt)}</strong>
        <span>Última atualização</span>
      </span>
    </button>
  );
}
