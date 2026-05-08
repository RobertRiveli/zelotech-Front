import { formatShortDate } from "../../utils/dashboardFormatters";
import { EmptyState } from "../shared/EmptyState";

export function ResidentList({ residents }) {
  if (residents.length === 0) {
    return <EmptyState title="Nenhum residente ativo encontrado." />;
  }

  return (
    <div className="dashboard-compact-list">
      {residents.slice(0, 5).map((resident) => (
        <article className="dashboard-compact-item" key={resident.id}>
          <div>
            <strong>{resident.fullName}</strong>
            <span>
              {resident.bloodType ? `Tipo ${resident.bloodType}` : "Sem tipo sanguíneo"}
            </span>
          </div>
          <small>{formatShortDate(resident.admissionDate)}</small>
        </article>
      ))}
    </div>
  );
}
