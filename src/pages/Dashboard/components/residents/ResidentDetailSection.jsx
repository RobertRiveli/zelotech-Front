export function ResidentDetailSection({ action, children, title }) {
  return (
    <section className="resident-detail-section">
      <div className="resident-detail-section-header">
        <h3>{title}</h3>
        <span>{action}</span>
      </div>
      {children}
    </section>
  );
}
