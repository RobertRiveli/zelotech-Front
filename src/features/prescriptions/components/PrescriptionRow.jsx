import { formatDateRange } from "@/shared/utils/dateFormatter";
import { getMedicationName } from "@/features/medications/utils/medicationFormatters";
import { formatPrescriptionDosage } from "@/features/prescriptions/utils/prescriptionFormatters";
import { getPrescriptionStatus } from "@/features/prescriptions/utils/prescriptionDashboardUtils";

export function PrescriptionRow({
  currentTime,
  isMutating,
  isSelected,
  onDeactivate,
  onEdit,
  onSelect,
  prescription,
}) {
  const status = getPrescriptionStatus(prescription, currentTime);

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(prescription);
    }
  }

  function handleEdit(event) {
    event.stopPropagation();
    onEdit(prescription);
  }

  function handleDeactivate(event) {
    event.stopPropagation();
    onDeactivate(prescription);
  }

  return (
    <tr
      aria-selected={isSelected}
      className={`prescription-table-row${isSelected ? " is-selected" : ""}`}
      tabIndex={0}
      onClick={() => onSelect(prescription)}
      onKeyDown={handleKeyDown}
    >
      <td data-label="Status">
        <span className={`dashboard-status-badge is-${status.tone}`}>
          {status.label}
        </span>
      </td>
      <td data-label="Residente">
        <strong>{prescription.resident?.fullName ?? "Residente"}</strong>
      </td>
      <td data-label="Medicamento">
        {getMedicationName(prescription.medication)}
      </td>
      <td data-label="Dose e frequência">
        <strong>{formatPrescriptionDosage(prescription)}</strong>
        <span>{prescription.frequency}</span>
      </td>
      <td data-label="Período">
        {formatDateRange(prescription.startDate, prescription.endDate)}
      </td>
      <td data-label="Ações">
        <div className="prescription-row-actions">
          <button
            aria-label="Editar prescrição"
            className="prescription-icon-button"
            disabled={isMutating}
            title="Editar"
            type="button"
            onClick={handleEdit}
          >
            <PencilIcon />
          </button>
          <button
            aria-label="Desativar prescrição"
            className="prescription-icon-button is-danger"
            disabled={isMutating}
            title="Desativar"
            type="button"
            onClick={handleDeactivate}
          >
            <PowerIcon />
          </button>
        </div>
      </td>
    </tr>
  );
}

function PencilIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 20h9" />
      <path d="m16.5 3.5 4 4L8 20l-5 1 1-5L16.5 3.5Z" />
    </svg>
  );
}

function PowerIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 2v10" />
      <path d="M18.4 6.6a9 9 0 1 1-12.8 0" />
    </svg>
  );
}
