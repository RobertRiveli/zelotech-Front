import { EmptyState } from "@/shared/ui/EmptyState";

export function ResidentConditionList({ healthConditions }) {
  if (healthConditions.length === 0) {
    return <EmptyState title="Nenhuma condição de saúde vinculada." />;
  }

  return (
    <div className="resident-detail-list">
      {healthConditions.slice(0, 4).map((condition) => (
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
