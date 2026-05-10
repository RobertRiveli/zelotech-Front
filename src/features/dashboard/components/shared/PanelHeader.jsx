export function PanelHeader({ overline, title, action }) {
  return (
    <div className="dashboard-panel-header">
      <div>
        <span className="overline">{overline}</span>
        <h2>{title}</h2>
      </div>
      {action ? <span className="dashboard-panel-action">{action}</span> : null}
    </div>
  );
}
