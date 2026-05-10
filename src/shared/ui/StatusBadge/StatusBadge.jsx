export function StatusBadge({ children, tone = "muted" }) {
  return (
    <span className={`dashboard-status-badge is-${tone}`}>
      {children}
    </span>
  );
}
