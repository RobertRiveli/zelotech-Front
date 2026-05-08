export function LoadingRows({ compact = false }) {
  return (
    <div className="dashboard-loading-list" aria-label="Carregando">
      {Array.from({ length: compact ? 3 : 5 }).map((_, index) => (
        <div className="dashboard-loading-row" key={index} />
      ))}
    </div>
  );
}
