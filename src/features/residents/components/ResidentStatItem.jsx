export function ResidentStatItem({ label, value }) {
  return (
    <div className="resident-stat-item">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
