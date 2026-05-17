import { AdministrationStatusBadge } from "@/features/medication-administrations/components/AdministrationStatusBadge";
import {
  getDosage,
  getMedicationName,
} from "@/features/medications/utils/medicationFormatters";
import {
  medicationAdministrationReportPeriods,
  medicationAdministrationReportStatusOptions,
} from "@/features/reports/constants/medicationAdministrationReport";
import { useMedicationAdministrationReport } from "@/features/reports/hooks/useMedicationAdministrationReport";
import { getMedicationAdministrationDisplayStatus } from "@/features/reports/utils/medicationAdministrationReport";
import { formatDateTime } from "@/shared/utils/dateFormatter";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingRows } from "@/shared/ui/LoadingRows";
import { MetricCard } from "@/shared/ui/MetricCard";
import { PanelHeader } from "@/shared/ui/PanelHeader";

export function MedicationAdministrationReportView({
  administrations,
  currentTime,
  isLoading,
  medications,
  prescriptions,
  residents,
  searchTerm,
}) {
  const report = useMedicationAdministrationReport({
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
      <section className="dashboard-hero reports-hero">
        <div className="dashboard-hero-copy">
          <span className="overline">Relatórios</span>
          <h2>Administração de medicamentos</h2>
          <p>
            Acompanhe adesão, atrasos, recusas e perdas em um recorte
            auditável da rotina medicamentosa.
          </p>
        </div>

        <div className="dashboard-hero-status" aria-label="Resumo do relatório">
          <span className="dashboard-company-status is-active">
            {getPeriodLabel(report.periodId)}
          </span>
          <strong>{report.stats.adherenceRate}% adesão</strong>
          <span>{report.stats.total} doses previstas</span>
        </div>
      </section>

      <section className="dashboard-overview-grid" aria-label="Resumo do relatório">
        <MetricCard
          detail={`${report.filteredAdministrations.length} registros no filtro`}
          label="Doses previstas"
          loading={report.isBusy}
          value={report.stats.total}
        />
        <MetricCard
          detail={`${report.stats.adherenceRate}% de adesão`}
          label="Administradas"
          loading={report.isBusy}
          tone="success"
          value={report.stats.administered}
        />
        <MetricCard
          detail="pendentes com horário vencido"
          label="Atrasadas"
          loading={report.isBusy}
          tone={report.stats.late > 0 ? "danger" : "success"}
          value={report.stats.late}
        />
        <MetricCard
          detail="recusas e perdas"
          label="Ocorrências"
          loading={report.isBusy}
          tone={report.stats.incidents > 0 ? "warning" : "success"}
          value={report.stats.incidents}
        />
      </section>

      <section className="dashboard-panel report-filters-panel">
        <PanelHeader
          action={`${report.filteredAdministrations.length} resultados`}
          overline="Filtros"
          title="Recorte do relatório"
        />

        <div className="report-filter-grid">
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
              placeholder="Residente, medicamento, cuidador ou observação"
              value={report.localSearch}
              onChange={(event) => report.setLocalSearch(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="report-layout">
        <section className="dashboard-panel report-main-panel">
          <div className="report-panel-heading">
            <PanelHeader
              action={`${report.stats.total} registros`}
              overline="Tabela"
              title="Administrações no período"
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
            <div className="report-table-wrap">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Data e horário</th>
                    <th>Residente</th>
                    <th>Medicamento</th>
                    <th>Dose</th>
                    <th>Cuidador</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.filteredAdministrations.map((administration) => {
                    const displayStatus = getMedicationAdministrationDisplayStatus(
                      administration,
                      currentTime,
                    );

                    return (
                      <tr key={administration.id}>
                        <td>{formatDateTime(administration.scheduledAt)}</td>
                        <td>
                          <strong>
                            {administration.resident?.fullName ?? "Residente"}
                          </strong>
                        </td>
                        <td>{getMedicationName(administration.medication)}</td>
                        <td>{getDosage(administration)}</td>
                        <td>
                          {administration.caregiver?.fullName ?? "Não registrado"}
                        </td>
                        <td>
                          <AdministrationStatusBadge status={displayStatus} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="Nenhuma administração encontrada para o recorte atual." />
          )}
        </section>

        <aside className="dashboard-panel report-side-panel">
          <PanelHeader
            action={`${report.stats.total} doses`}
            overline="Distribuição"
            title="Status das administrações"
          />

          <div className="report-status-list">
            {report.distribution.map((item) => (
              <article className="report-status-item" key={item.id}>
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.count} registros</span>
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

          <div className="report-attention-list">
            <PanelHeader
              action={`${report.attentionMedications.length} itens`}
              overline="Atenção"
              title="Medicamentos com mais ocorrências"
            />

            {report.attentionMedications.length > 0 ? (
              report.attentionMedications.map((item) => (
                <article className="report-attention-item" key={item.key}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.total} doses no recorte</span>
                  </div>
                  <small>
                    {item.score} ocorrência{item.score === 1 ? "" : "s"}
                  </small>
                </article>
              ))
            ) : (
              <EmptyState title="Nenhum ponto de atenção no recorte." />
            )}
          </div>
        </aside>
      </section>
    </>
  );
}

function getPeriodLabel(periodId) {
  return (
    medicationAdministrationReportPeriods.find((period) => period.id === periodId)
      ?.label ?? "Hoje"
  );
}
