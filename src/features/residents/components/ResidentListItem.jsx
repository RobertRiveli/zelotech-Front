import {
  formatGender,
  getAgeLabel,
} from "@/features/residents/utils/residentFormatters";
import { getInitials } from "@/shared/utils/nameFormatter";
import { ResidentStatusBadge } from "./ResidentStatusBadge";

export function ResidentListItem({
  className = "",
  currentTime,
  isSelected,
  onSelectResident,
  resident,
  showMeta = true,
  stats,
  statsAriaLabel,
}) {
  const classes = [
    "resident-row",
    className,
    isSelected ? "is-selected" : "",
    showMeta ? "" : "is-without-meta",
  ]
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

      {showMeta ? (
        <span className="resident-row-meta">
          <ResidentStatusBadge status={resident.status} />
          <small>
            {resident.bloodType ? `Tipo ${resident.bloodType}` : "Sem tipo sanguíneo"}
          </small>
        </span>
      ) : null}

      <span className="resident-row-stats" aria-label={statsAriaLabel}>
        {stats.map((stat) => (
          <small key={stat}>{stat}</small>
        ))}
      </span>
    </button>
  );
}
