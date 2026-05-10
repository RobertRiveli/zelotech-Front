import { EmptyState } from "@/shared/ui/EmptyState";

export function AlertList({ alerts }) {
  if (alerts.length === 0) {
    return <EmptyState title="Nenhum alerta crítico no momento." />;
  }

  return (
    <div className="dashboard-alert-list">
      {alerts.map((alert) => (
        <article className={`dashboard-alert-card is-${alert.tone}`} key={alert.id}>
          <span>{alert.label}</span>
          <strong>{alert.value}</strong>
          <small>{alert.detail}</small>
        </article>
      ))}
    </div>
  );
}
