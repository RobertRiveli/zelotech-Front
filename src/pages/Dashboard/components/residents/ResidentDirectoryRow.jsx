import {
  formatGender,
  getAgeLabel,
  getInitials,
} from "../../utils/dashboardFormatters";
import { ResidentStatusBadge } from "./ResidentStatusBadge";

export function ResidentDirectoryRow({
  administrationSummary,
  currentTime,
  isSelected,
  onSelectResident,
  prescriptionCount,
  resident,
}) {
  return (
    <button
      className={`resident-row${isSelected ? " is-selected" : ""}`}
      type="button"
      onClick={() => onSelectResident(resident.id)}
    >
      <span className="resident-row-avatar" aria-hidden="true">
        {getInitials(resident.fullName)}
      </span>

      <span className="resident-row-main">
        <strong>{resident.fullName}</strong>
        <span>
          {getAgeLabel(resident, currentTime)} · {formatGender(resident.gender)}
        </span>
      </span>

      <span className="resident-row-meta">
        <ResidentStatusBadge status={resident.status} />
        <small>
          {resident.bloodType ? `Tipo ${resident.bloodType}` : "Sem tipo sanguíneo"}
        </small>
      </span>

      <span className="resident-row-stats" aria-label="Resumo operacional">
        <small>{prescriptionCount} prescrições</small>
        <small>{administrationSummary.pending} pendentes</small>
        <small>{administrationSummary.late} atrasadas</small>
      </span>
    </button>
  );
}
