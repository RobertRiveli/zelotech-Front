import {
  formatGender,
  getAgeLabel,
  getInitials,
} from "../../utils/dashboardFormatters";
import { ResidentStatusBadge } from "./ResidentStatusBadge";

export function ResidentRow({
  className = "",
  currentTime,
  isSelected,
  onSelectResident,
  resident,
  stats,
  statsAriaLabel,
}) {
  const classes = ["resident-row", className, isSelected ? "is-selected" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      type="button"
      onClick={() => onSelectResident(resident.id)}
    >
      <span className="resident-row-avatar" aria-hidden="true">
        {getInitials(resident.fullName ?? "")}
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

      <span className="resident-row-stats" aria-label={statsAriaLabel}>
        {stats.map((stat) => (
          <small key={stat}>{stat}</small>
        ))}
      </span>
    </button>
  );
}
