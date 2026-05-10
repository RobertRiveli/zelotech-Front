export function MetricCard({
  isActive = false,
  label,
  value,
  detail,
  tone = "default",
  loading = false,
  onClick,
}) {
  const className = [
    "dashboard-card",
    `dashboard-card-${tone}`,
    onClick ? "dashboard-card-button" : "",
    isActive ? "is-active" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const content = (
    <>
      <span>{label}</span>
      <strong>{loading ? "..." : value}</strong>
      <small>{detail}</small>
    </>
  );

  if (onClick) {
    return (
      <button
        aria-pressed={isActive}
        className={className}
        type="button"
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <article className={className}>
      {content}
    </article>
  );
}
