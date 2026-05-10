import { EmptyState } from "@/shared/ui/EmptyState";

export function ResidentConditionList({ healthConditions }) {
  if (healthConditions.length === 0) {
    return <EmptyState title="Nenhuma condição de saúde vinculada." />;
  }

  return (
    <div
      aria-label="Lista de condições de saúde do residente"
      className="resident-detail-list"
      tabIndex={0}
    >
      {healthConditions.map((condition) => (
        <article className="resident-detail-item" key={condition.id}>
          <div>
            <strong>{condition.healthCondition?.name ?? "Condição"}</strong>
            <span>{condition.healthCondition?.category ?? "Sem categoria"}</span>
          </div>
          {condition.observations ? <small>{condition.observations}</small> : null}
        </article>
      ))}
    </div>
  );
}
