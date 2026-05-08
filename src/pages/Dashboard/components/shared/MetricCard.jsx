export function MetricCard({ label, value, detail, tone = "default", loading = false }) {
  return (
    <article className={`dashboard-card dashboard-card-${tone}`}>
      <span>{label}</span>
      <strong>{loading ? "..." : value}</strong>
      <small>{detail}</small>
    </article>
  );
}
