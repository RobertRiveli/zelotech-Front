import { formatShortDateTime } from "@/shared/utils/dateFormatter";
import { formatMedicationForm } from "@/features/medications/utils/medicationDashboardUtils";
import { getMedicationName } from "@/features/medications/utils/medicationFormatters";

export function MedicationRow({
  isAdmin,
  isMutating,
  isSelected,
  medication,
  onDelete,
  onEdit,
  onSelect,
}) {
  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(medication);
    }
  }

  function handleEdit(event) {
    event.stopPropagation();
    onEdit(medication);
  }

  function handleDelete(event) {
    event.stopPropagation();
    onDelete(medication);
  }

  return (
    <tr
      aria-selected={isSelected}
      className={`medication-table-row${isSelected ? " is-selected" : ""}`}
      tabIndex={0}
      onClick={() => onSelect(medication)}
      onKeyDown={handleKeyDown}
    >
      <td data-label="Nome genérico">
        <strong>{medication.genericName}</strong>
      </td>
      <td data-label="Marca">{medication.brandName || "Não informado"}</td>
      <td data-label="Forma">{formatMedicationForm(medication.form)}</td>
      <td data-label="Dosagem">{medication.strength || "Não informado"}</td>
      <td data-label="Atualizado em">
        {formatShortDateTime(medication.updatedAt)}
      </td>
      <td data-label="Ações">
        {isAdmin ? (
          <div className="medication-row-actions">
            <button
              aria-label={`Editar ${getMedicationName(medication)}`}
              className="medication-icon-button"
              disabled={isMutating}
              title="Editar"
              type="button"
              onClick={handleEdit}
            >
              <PencilIcon />
            </button>
            <button
              aria-label={`Remover ${getMedicationName(medication)}`}
              className="medication-icon-button is-danger"
              disabled={isMutating}
              title="Remover"
              type="button"
              onClick={handleDelete}
            >
              <TrashIcon />
            </button>
          </div>
        ) : (
          <span className="medication-readonly-note">Somente leitura</span>
        )}
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

function TrashIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 15h10l1-15" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}
