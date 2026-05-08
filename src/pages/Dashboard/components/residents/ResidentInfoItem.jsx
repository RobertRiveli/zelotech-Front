export function ResidentInfoItem({ label, value }) {
  return (
    <div className="resident-info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
