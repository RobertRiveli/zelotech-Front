import { formatTime } from "@/shared/utils/dateFormatter";
import { AdministrationStatusBadge } from "./AdministrationStatusBadge";
import {
  getAdministrationDisplayStatus,
  isPendingAdministration,
} from "@/features/medication-administrations/utils/administrationDashboardUtils";
import {
  getDosage,
  getMedicationName,
} from "@/features/medications/utils/medicationFormatters";

export function AdministrationRow({
  administration,
  currentTime,
  isMutating,
  isSelected,
  onAction,
  onOpenDetail,
}) {
  const displayStatus = getAdministrationDisplayStatus(
    administration,
    currentTime,
  );
  const isLate = displayStatus === "LATE";
  const isPending = isPendingAdministration(administration);
  const prescription = administration.prescription ?? {};

  function handleOpenDetail() {
    if (isMutating) {
      return;
    }

    onOpenDetail(administration);
  }

  function handleKeyDown(event) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleOpenDetail();
  }

  function handleActionClick(event, actionType) {
    event.stopPropagation();
    onAction(actionType, administration);
  }

  return (
    <article
      aria-label={`Abrir detalhes da administração de ${
        administration.resident?.fullName ?? "residente"
      }`}
      className={`administration-row${
        isLate ? " is-late" : ""
      }${isSelected ? " is-selected" : ""}`}
      role="button"
      tabIndex={0}
      onClick={handleOpenDetail}
      onKeyDown={handleKeyDown}
    >
      <AdministrationStatusBadge status={displayStatus} />

      <time
        className="administration-row-time"
        dateTime={administration.scheduledAt}
      >
        {formatTime(administration.scheduledAt)}
      </time>

      <div className="administration-row-main">
        <strong>{administration.resident?.fullName ?? "Residente"}</strong>
        <span>{getMedicationName(administration.medication)}</span>
      </div>

      <div className="administration-row-meta">
        <strong>{getDosage(administration)}</strong>
        <span>
          {prescription.route || "Via não informada"} -{" "}
          {prescription.frequency || "Frequência não informada"}
        </span>
      </div>

      <div className="administration-row-actions">
        {isPending ? (
          <button
            className="dashboard-button dashboard-button-primary"
            disabled={isMutating}
            type="button"
            onClick={(event) => handleActionClick(event, "administer")}
          >
            Administrar
          </button>
        ) : null}
      </div>
    </article>
  );
}
