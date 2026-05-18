import { StatusBadge } from "@/shared/ui/StatusBadge";
import {
  medicationAdministrationReportPeriods,
  medicationAdministrationReportStatusOptions,
} from "@/features/reports/constants/medicationAdministrationReport";
import { useResidentReport } from "@/features/reports/residents/hooks/useResidentReport";
import {
  formatResidentReportPrescriptionPeriod,
  getResidentName,
  getResidentReportPrescriptionSummary,
} from "@/features/reports/residents/utils/residentReport";
import {
  formatGender,
  getAgeLabel,
  getResidentStatusLabel,
  getResidentStatusTone,
} from "@/features/residents/utils/residentFormatters";
import { getMedicationName } from "@/features/medications/utils/medicationFormatters";
import { formatDateTime, formatShortDate } from "@/shared/utils/dateFormatter";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingRows } from "@/shared/ui/LoadingRows";
import { PanelHeader } from "@/shared/ui/PanelHeader";

export function ResidentReportView({
  administrations,
  currentTime,
  isLoading,
  onOpenResident,
  prescriptions,
  residents,
  searchTerm,
}) {
  const report = useResidentReport({
    administrations,
    currentTime,
    isLoading,
    prescriptions,
    residents,
    searchTerm,
  });
  const selectedResidentName = getResidentName(report.selectedResident);
  const canOpenResident = Boolean(onOpenResident && report.selectedResident?.id);

  return (
    <>
      <section className="dashboard-panel report-filters-panel">
        <PanelHeader
          action={`${report.timelineEvents.length} eventos`}
          overline="Filtros"
          title="Recorte do residente"
        />

        <div className="report-filter-grid resident-report-filter-grid">
          <label className="dashboard-field">
            <span>Residente</span>
            <select
              disabled={report.residentOptions.length === 0}
              value={report.residentFilter}
              onChange={(event) => report.setResidentFilter(event.target.value)}
            >
              {report.residentOptions.length === 0 ? (
                <option value="">Nenhum residente disponível</option>
              ) : null}
              {report.residentOptions.map((resident) => (
                <option key={resident.id} value={resident.id}>
                  {resident.fullName}
                </option>
              ))}
            </select>
          </label>

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
              placeholder="Medicamento, cuidador, dose ou observação"
              value={report.localSearch}
              onChange={(event) => report.setLocalSearch(event.target.value)}
            />
          </label>
        </div>
      </section>

      {!report.selectedResident && !report.isBusy ? (
        <section className="dashboard-panel">
          <EmptyState title="Nenhum residente disponível para montar o relatório." />
        </section>
      ) : (
        <section className="report-layout resident-report-layout">
          <section className="dashboard-panel report-main-panel">
            <div className="report-panel-heading">
              <PanelHeader
                action={`${report.timelineEvents.length} eventos`}
                overline="Linha do tempo"
                title="Administrações no período"
              />
              <button
                className="dashboard-button dashboard-button-muted"
                disabled={
                  report.isBusy || report.filteredAdministrations.length === 0
                }
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
            ) : report.timelineEvents.length > 0 ? (
              <div
                aria-label="Linha do tempo de administrações do residente"
                className="resident-report-timeline"
                tabIndex={0}
              >
                {report.timelineEvents.map((event) => (
                  <article
                    className={`resident-report-event is-${event.statusTone}`}
                    key={event.id}
                  >
                    <time dateTime={event.date}>{formatDateTime(event.date)}</time>
                    <div className="resident-report-event-copy">
                      <strong>{event.medicationName}</strong>
                      <span>{event.detail}</span>
                      {event.context.length > 0 ? (
                        <ul>
                          {event.context.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <StatusBadge tone={event.statusTone}>
                      {event.statusLabel}
                    </StatusBadge>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="Nenhuma administração encontrada para este residente no recorte." />
            )}
          </section>

          <aside className="dashboard-panel report-side-panel resident-report-side-panel">
            <section className="resident-report-side-section">
              <PanelHeader
                action={
                  report.selectedResident
                    ? getAgeLabel(report.selectedResident, currentTime)
                    : ""
                }
                overline="Residente"
                title={selectedResidentName}
              />

              {report.selectedResident ? (
                <>
                  <div className="resident-report-profile-grid">
                    <ResidentReportProfileItem
                      label="Nascimento"
                      value={formatShortDate(report.selectedResident.birthDate)}
                    />
                    <ResidentReportProfileItem
                      label="Admissão"
                      value={formatShortDate(report.selectedResident.admissionDate)}
                    />
                    <ResidentReportProfileItem
                      label="Gênero"
                      value={formatGender(report.selectedResident.gender)}
                    />
                    <ResidentReportProfileItem
                      label="Tipo sanguíneo"
                      value={report.selectedResident.bloodType ?? "Não informado"}
                    />
                    <ResidentReportProfileItem
                      label="Status"
                      value={
                        <StatusBadge
                          tone={getResidentStatusTone(report.selectedResident.status)}
                        >
                          {getResidentStatusLabel(report.selectedResident.status)}
                        </StatusBadge>
                      }
                    />
                  </div>

                  <button
                    className="dashboard-button dashboard-button-muted resident-report-open-button"
                    disabled={!canOpenResident}
                    type="button"
                    onClick={() => {
                      if (canOpenResident) {
                        onOpenResident(report.selectedResident.id);
                      }
                    }}
                  >
                    Ver residente
                  </button>
                </>
              ) : (
                <EmptyState title="Selecione um residente para ver os detalhes." />
              )}
            </section>

            <section className="resident-report-side-section">
              <PanelHeader
                action={`${report.healthConditions.length} itens`}
                overline="Saúde"
                title="Condições vinculadas"
              />

              {report.healthConditions.length > 0 ? (
                <div className="resident-report-context-list">
                  {report.healthConditions.map((condition) => (
                    <article
                      className="resident-report-context-item"
                      key={condition.id}
                    >
                      <div>
                        <strong>
                          {condition.healthCondition?.name ?? "Condição"}
                        </strong>
                        <span>
                          {condition.healthCondition?.category ??
                            "Sem categoria"}
                        </span>
                      </div>
                      {condition.observations ? (
                        <small>{condition.observations}</small>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState title="Nenhuma condição vinculada retornada." />
              )}
            </section>

            <section className="resident-report-side-section">
              <PanelHeader
                action={`${report.residentPrescriptions.length} ativas`}
                overline="Prescrições"
                title="Prescrições ativas"
              />

              {report.residentPrescriptions.length > 0 ? (
                <div className="resident-report-context-list">
                  {report.residentPrescriptions.map((prescription) => (
                    <article
                      className="resident-report-context-item"
                      key={prescription.id}
                    >
                      <div>
                        <strong>{getMedicationName(prescription.medication)}</strong>
                        <span>
                          {getResidentReportPrescriptionSummary(prescription)}
                        </span>
                      </div>
                      <small>
                        {formatResidentReportPrescriptionPeriod(prescription)}
                      </small>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState title="Nenhuma prescrição ativa retornada." />
              )}
            </section>

            <section className="resident-report-side-section">
              <PanelHeader
                action={`${report.stats.total} doses`}
                overline="Distribuição"
                title="Status no período"
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
            </section>
          </aside>
        </section>
      )}
    </>
  );
}

function ResidentReportProfileItem({ label, value }) {
  return (
    <div className="resident-report-profile-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
