import { formatShortDate } from "@/shared/utils/dateFormatter";
import { EmptyState } from "@/shared/ui/EmptyState";

export function ResidentList({ residents }) {
  if (residents.length === 0) {
    return <EmptyState title="Nenhum residente ativo encontrado." />;
  }

  return (
    <div
      className="dashboard-compact-list is-scrollable"
      role="region"
      aria-label="Admissões recentes"
      tabIndex={0}
    >
      {residents.map((resident) => (
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
