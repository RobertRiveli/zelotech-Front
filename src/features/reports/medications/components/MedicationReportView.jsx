import { useState } from "react";
import {
  medicationAdministrationReportPeriods,
  medicationAdministrationReportStatusOptions,
} from "@/features/reports/constants/medicationAdministrationReport";
import { useMedicationReport } from "@/features/reports/medications/hooks/useMedicationReport";
import { getMedicationName } from "@/features/medications/utils/medicationFormatters";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingRows } from "@/shared/ui/LoadingRows";
import { PanelHeader } from "@/shared/ui/PanelHeader";

export function MedicationReportView({
  administrations,
  currentTime,
  isLoading,
  medications,
  prescriptions,
  residents,
  searchTerm,
}) {
  const [expandedMedicationKey, setExpandedMedicationKey] = useState("");
  const report = useMedicationReport({
    administrations,
    currentTime,
    isLoading,
    medications,
    prescriptions,
    residents,
    searchTerm,
  });

  function handleMedicationToggle(medicationKey) {
    setExpandedMedicationKey((currentKey) =>
      currentKey === medicationKey ? "" : medicationKey,
    );
  }

  return (
    <>
      <section className="dashboard-panel report-filters-panel">
        <PanelHeader
          action={formatMedicationCount(report.medicationItems.length)}
          overline="Filtros"
          title="Recorte dos medicamentos"
        />

        <div className="report-filter-grid medication-report-filter-grid">
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
            <span>Status</span>
            <select
              value={report.statusFilter}
              onChange={(event) => report.setStatusFilter(event.target.value)}
            >
              {medicationAdministrationReportStatusOptions.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <label className="dashboard-field report-search-field">
            <span>Busca</span>
            <input
              placeholder="Medicamento, residente, prescritor, cuidador ou observação"
              value={report.localSearch}
              onChange={(event) => report.setLocalSearch(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="report-layout medication-report-layout">
        <section className="dashboard-panel report-main-panel">
          <div className="report-panel-heading">
            <PanelHeader
              action={formatMedicationCount(report.medicationItems.length)}
              overline="Lista"
              title="Uso por medicamento"
            />
            <button
              className="dashboard-button dashboard-button-muted"
              disabled={report.isBusy || report.medicationItems.length === 0}
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
          ) : report.medicationItems.length > 0 ? (
            <div className="medication-report-table-wrap">
              <table className="medication-report-table">
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Prescrições ativas</th>
                    <th>Residentes</th>
                    <th>Doses no período</th>
                    <th>Ocorrências</th>
                    <th>Adesão</th>
                  </tr>
                </thead>
                <tbody>
                  {report.medicationItems.map((item) => (
                    <MedicationReportRow
                      isExpanded={expandedMedicationKey === item.key}
                      item={item}
                      key={item.key}
                      onToggle={() => handleMedicationToggle(item.key)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="Nenhum medicamento encontrado para o recorte atual." />
          )}
        </section>

        <aside className="dashboard-panel report-side-panel medication-report-side-panel">
          <section className="medication-report-side-section">
            <PanelHeader
              action={`${report.summary.adherenceRate}% adesão`}
              overline="Resumo"
              title="Visão geral"
            />

            <div className="medication-summary-groups">
              <div className="medication-summary-group">
                <strong>Prescrições ativas</strong>
                <div className="medication-summary-grid">
                  <MedicationSummaryItem
                    label="Medicamentos"
                    value={report.summary.medications}
                  />
                  <MedicationSummaryItem
                    label="Prescrições"
                    value={report.summary.activePrescriptions}
                  />
                  <MedicationSummaryItem
                    label="Residentes"
                    value={report.summary.residents}
                  />
                </div>
              </div>

              <div className="medication-summary-group">
                <strong>Doses no período</strong>
                <div className="medication-summary-grid">
                  <MedicationSummaryItem
                    label="Doses"
                    value={report.summary.total}
                  />
                  <MedicationSummaryItem
                    label="Administradas"
                    value={report.summary.administered}
                  />
                  <MedicationSummaryItem
                    label="Ocorrências"
                    value={report.summary.occurrences}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="medication-report-side-section">
            <PanelHeader
              action={formatDoseCount(report.summary.total)}
              overline="Distribuição"
              title="Status das doses"
            />

            <div className="report-status-list">
              {report.distribution.map((item) => (
                <article className="report-status-item" key={item.id}>
                  <div>
                    <strong>{item.label}</strong>
                    <span>{formatDoseCount(item.count)}</span>
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

          <section className="medication-report-side-section">
            <PanelHeader
              action={`${report.occurrenceHighlights.length} itens`}
              overline="Atenção"
              title="Medicamentos com ocorrências"
            />

            {report.occurrenceHighlights.length > 0 ? (
              <div className="medication-highlight-list">
                {report.occurrenceHighlights.map((item) => (
                  <MedicationHighlightItem
                    detail={`${formatDoseCount(item.total)} no período`}
                    key={item.key}
                    label={item.name}
                    value={formatOccurrenceCount(item.occurrences)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="Nenhum medicamento com ocorrência no recorte." />
            )}
          </section>

          <section className="medication-report-side-section">
            <PanelHeader
              action={`${report.prescriptionHighlights.length} itens`}
              overline="Prescrições"
              title="Medicamentos mais prescritos"
            />

            {report.prescriptionHighlights.length > 0 ? (
              <div className="medication-highlight-list">
                {report.prescriptionHighlights.map((item) => (
                  <MedicationHighlightItem
                    detail={`${item.residents} residente${
                      item.residents === 1 ? "" : "s"
                    }`}
                    key={item.key}
                    label={item.name}
                    value={formatPrescriptionCount(item.activePrescriptions)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="Nenhuma prescrição ativa no recorte." />
            )}
          </section>
        </aside>
      </section>
    </>
  );
}

function MedicationReportRow({ isExpanded, item, onToggle }) {
  return (
    <>
      <tr className={item.occurrences > 0 ? "has-occurrences" : ""}>
        <td>
          <button
            aria-expanded={isExpanded}
            className="medication-report-expand"
            data-detail-label={
              isExpanded ? "Ocultar prescrições" : "Ver prescrições"
            }
            type="button"
            onClick={onToggle}
          >
            <span>
              {[item.formLabel, item.strength].filter(Boolean).join(" - ")}
            </span>
            <strong>{item.name}</strong>
          </button>
        </td>
        <td>{item.activePrescriptions}</td>
        <td>{item.residents}</td>
        <td>{item.total}</td>
        <td>{item.occurrences}</td>
        <td>{item.total > 0 ? `${item.adherenceRate}%` : "-"}</td>
      </tr>

      {isExpanded ? (
        <tr className="medication-report-detail-row">
          <td colSpan={6}>
            <div className="medication-report-details">
              <strong>Prescrições ativas vinculadas</strong>
              {item.prescriptionSummaries.length > 0 ? (
                <ul>
                  {item.prescriptionSummaries.map((summary) => (
                    <li key={summary}>{summary}</li>
                  ))}
                </ul>
              ) : (
                <span>Nenhuma prescrição ativa vinculada.</span>
              )}
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function MedicationSummaryItem({ label, value }) {
  return (
    <article className="medication-summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function MedicationHighlightItem({ detail, label, value }) {
  return (
    <article className="medication-highlight-item">
      <div>
        <strong>{label}</strong>
        <span>{detail}</span>
      </div>
      <small>{value}</small>
    </article>
  );
}

function formatDoseCount(count) {
  return `${count} dose${count === 1 ? "" : "s"}`;
}

function formatMedicationCount(count) {
  return `${count} medicamento${count === 1 ? "" : "s"}`;
}

function formatOccurrenceCount(count) {
  return `${count} ocorrência${count === 1 ? "" : "s"}`;
}

function formatPrescriptionCount(count) {
  return `${count} prescriç${count === 1 ? "ão ativa" : "ões ativas"}`;
}
