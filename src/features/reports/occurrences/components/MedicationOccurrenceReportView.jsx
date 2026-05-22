import { AdministrationStatusBadge } from "@/features/medication-administrations/components/AdministrationStatusBadge";
import {
  getDosage,
  getMedicationName,
} from "@/features/medications/utils/medicationFormatters";
import {
  medicationAdministrationOccurrenceStatusOptions,
  medicationAdministrationReportPeriods,
} from "@/features/reports/constants/medicationAdministrationReport";
import { useMedicationOccurrenceReport } from "@/features/reports/occurrences/hooks/useMedicationOccurrenceReport";
import { getMedicationAdministrationDisplayStatus } from "@/features/reports/utils/medicationAdministrationReport";
import { getRecordResidentId } from "@/features/residents/utils/residentDashboardUtils";
import { formatDateTime } from "@/shared/utils/dateFormatter";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingRows } from "@/shared/ui/LoadingRows";
import { PanelHeader } from "@/shared/ui/PanelHeader";

export function MedicationOccurrenceReportView({
  administrations,
  currentTime,
  isLoading,
  medications,
  onOpenResident,
  prescriptions,
  residents,
  searchTerm,
}) {
  const report = useMedicationOccurrenceReport({
    administrations,
    currentTime,
    isLoading,
    medications,
    prescriptions,
    residents,
    searchTerm,
  });

  return (
    <>
      <section className="dashboard-panel report-filters-panel">
        <PanelHeader
          action={formatCount(report.filteredAdministrations.length)}
          overline="Filtros"
          title="Recorte das ocorrências"
        />

        <div className="report-filter-grid occurrence-report-filter-grid">
          <label className="dashboard-field">
            <span>Período</span>
            <select
              value={report.periodId}
              onChange={(event) => report.setPeriodId(event.target.value)}
            >
              {medicationAdministrationReportPeriods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.label}
                </option>
              ))}
            </select>
          </label>

          {report.periodId === "custom" ? (
            <>
              <label className="dashboard-field">
                <span>Início</span>
                <input
                  type="date"
                  value={report.customStartDate}
                  onChange={(event) =>
                    report.setCustomStartDate(event.target.value)
                  }
                />
              </label>
              <label className="dashboard-field">
                <span>Fim</span>
                <input
                  type="date"
                  value={report.customEndDate}
                  onChange={(event) => report.setCustomEndDate(event.target.value)}
                />
              </label>
            </>
          ) : null}

          <label className="dashboard-field">
            <span>Residente</span>
            <select
              value={report.residentFilter}
              onChange={(event) => report.setResidentFilter(event.target.value)}
            >
              <option value="all">Todos os residentes</option>
              {report.residentOptions.map((resident) => (
                <option key={resident.id} value={resident.id}>
                  {resident.fullName}
                </option>
              ))}
            </select>
          </label>

          <label className="dashboard-field">
            <span>Medicamento</span>
            <select
              value={report.medicationFilter}
              onChange={(event) => report.setMedicationFilter(event.target.value)}
            >
              <option value="all">Todos os medicamentos</option>
              {report.medicationOptions.map((medication) => (
                <option key={medication.id} value={medication.id}>
                  {getMedicationName(medication)}
                </option>
              ))}
            </select>
          </label>

          <label className="dashboard-field">
            <span>Ocorrência</span>
            <select
              value={report.statusFilter}
              onChange={(event) => report.setStatusFilter(event.target.value)}
            >
              {medicationAdministrationOccurrenceStatusOptions.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <label className="dashboard-field report-search-field">
            <span>Busca</span>
            <input
              placeholder="Residente, medicamento, cuidador, justificativa ou observação"
              value={report.localSearch}
              onChange={(event) => report.setLocalSearch(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="report-layout occurrence-report-layout">
        <section className="dashboard-panel report-main-panel">
          <div className="report-panel-heading">
            <PanelHeader
              action={formatCount(report.stats.total)}
              overline="Lista"
              title="Ocorrências no período"
            />
            <button
              className="dashboard-button dashboard-button-muted"
              disabled={report.isBusy || report.filteredAdministrations.length === 0}
              type="button"
              onClick={report.exportCsv}
            >
              Exportar CSV
            </button>
          </div>

          {report.reportError ? (
            <div
              className="dashboard-form-alert dashboard-form-alert-danger"
              role="status"
            >
              {report.reportError}
            </div>
          ) : null}

          {report.isBusy ? (
            <LoadingRows />
          ) : report.filteredAdministrations.length > 0 ? (
            <div
              aria-label="Lista de ocorrências de administrações"
              className="occurrence-report-list"
              tabIndex={0}
            >
              {report.filteredAdministrations.map((administration) => (
                <OccurrenceReportItem
                  administration={administration}
                  currentTime={currentTime}
                  key={administration.id}
                  onOpenResident={onOpenResident}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="Nenhuma ocorrência encontrada para o recorte atual." />
          )}
        </section>

        <aside className="dashboard-panel report-side-panel occurrence-report-side-panel">
          <section className="occurrence-report-side-section">
            <PanelHeader
              action={`${report.stats.residents} residente${
                report.stats.residents === 1 ? "" : "s"
              }`}
              overline="Resumo"
              title="Ocorrências no recorte"
            />

            <div className="occurrence-summary-grid">
              <OccurrenceSummaryItem label="Total" value={report.stats.total} />
              <OccurrenceSummaryItem label="Atrasadas" value={report.stats.late} />
              <OccurrenceSummaryItem
                label="Recusadas"
                value={report.stats.refused}
              />
              <OccurrenceSummaryItem label="Perdidas" value={report.stats.missed} />
              <OccurrenceSummaryItem
                label="Canceladas"
                value={report.stats.canceled}
              />
            </div>
          </section>

          <section className="occurrence-report-side-section">
            <PanelHeader
              action={formatCount(report.stats.total)}
              overline="Distribuição"
              title="Tipo de ocorrência"
            />

            <div className="report-status-list">
              {report.distribution.map((item) => (
                <article className="report-status-item" key={item.id}>
                  <div>
                    <strong>{item.label}</strong>
                    <span>{formatCount(item.count)}</span>
                  </div>
                  <div
                    className={`report-status-bar is-${item.tone}`}
                    aria-hidden="true"
                  >
                    <span style={{ width: `${item.percent}%` }} />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="occurrence-report-side-section">
            <PanelHeader
              action={`${report.residentHighlights.length} itens`}
              overline="Atenção"
              title="Residentes com mais ocorrências"
            />

            {report.residentHighlights.length > 0 ? (
              <div className="occurrence-highlight-list">
                {report.residentHighlights.map((resident) => (
                  <article className="occurrence-highlight-item" key={resident.key}>
                    <div>
                      <strong>{resident.name}</strong>
                      <span>
                        {formatCount(resident.total)}
                        {resident.lastOccurrence
                          ? ` · última em ${resident.lastOccurrence}`
                          : ""}
                      </span>
                    </div>
                    <small>{resident.lastStatusLabel}</small>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="Nenhum residente em atenção no recorte." />
            )}
          </section>

          <section className="occurrence-report-side-section">
            <PanelHeader
              action={`${report.attentionMedications.length} itens`}
              overline="Atenção"
              title="Medicamentos com ocorrências"
            />

            {report.attentionMedications.length > 0 ? (
              <div className="occurrence-highlight-list">
                {report.attentionMedications.map((item) => (
                  <article className="occurrence-highlight-item" key={item.key}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.total} doses no recorte</span>
                    </div>
                    <small>{formatCount(item.score)}</small>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="Nenhum medicamento em atenção no recorte." />
            )}
          </section>
        </aside>
      </section>
    </>
  );
}

function OccurrenceReportItem({ administration, currentTime, onOpenResident }) {
  const displayStatus = getMedicationAdministrationDisplayStatus(
    administration,
    currentTime,
  );
  const residentId = getRecordResidentId(administration);
  const canOpenResident = Boolean(onOpenResident && residentId);
  const context = buildOccurrenceContext(administration);

  const className = `occurrence-report-item is-${displayStatus.toLowerCase()}`;

  return (
    <article className={className}>
      <time dateTime={administration.scheduledAt}>
        {formatDateTime(administration.scheduledAt)}
      </time>

      <div className="occurrence-report-item-copy">
        <span>{administration.resident?.fullName ?? "Residente"}</span>
        <strong>{getMedicationName(administration.medication)}</strong>
        <small>{getDosage(administration)}</small>

        {context.length > 0 ? (
          <ul>
            {context.map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                {item.value}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="occurrence-report-item-actions">
        <AdministrationStatusBadge status={displayStatus} />
        {canOpenResident ? (
          <button
            className="dashboard-button dashboard-button-muted"
            type="button"
            onClick={() => onOpenResident(residentId)}
          >
            Ver residente
          </button>
        ) : null}
      </div>
    </article>
  );
}

function OccurrenceSummaryItem({ label, value }) {
  return (
    <article className="occurrence-summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function buildOccurrenceContext(administration) {
  return [
    {
      label: "Cuidador",
      value:
        administration.caregiver?.fullName ??
        administration.caregiver?.name ??
        "",
    },
    { label: "Justificativa", value: administration.reason ?? "" },
    { label: "Observação", value: administration.notes ?? "" },
  ].filter((item) => item.value);
}

function formatCount(count) {
  return `${count} ocorrência${count === 1 ? "" : "s"}`;
}
