import {
  formatDateRange,
  formatDateTime,
  formatPrescriptionDosage,
  formatShortDate,
  getMedicationName,
} from "../../utils/dashboardFormatters";
import { getPrescriptionStatus } from "../../utils/prescriptionDashboardUtils";
import { EmptyState } from "../shared/EmptyState";
import { LoadingRows } from "../shared/LoadingRows";
import { PanelHeader } from "../shared/PanelHeader";

export function PrescriptionDetailPanel({
  currentTime,
  detailStatus,
  isMutating,
  onDeactivate,
  onEdit,
  prescription,
}) {
  if (detailStatus.isLoading && !prescription) {
    return <LoadingRows />;
  }

  if (!prescription) {
    return <EmptyState title="Nenhuma prescrição selecionada." />;
  }

  const status = getPrescriptionStatus(prescription, currentTime);

  return (
    <div className="prescription-detail">
      <PanelHeader
        overline="Detalhe"
        title={prescription.resident?.fullName ?? "Prescrição"}
        action={status.label}
      />

      {detailStatus.error ? (
        <div className="resident-inline-alert" role="status">
          {detailStatus.error}
        </div>
      ) : null}

      <div className="prescription-detail-summary">
        <div>
          <span>Medicamento</span>
          <strong>{getMedicationName(prescription.medication)}</strong>
        </div>
        <span className={`dashboard-status-badge is-${status.tone}`}>
          {status.label}
        </span>
      </div>

      <div className="dashboard-detail-grid">
        <DetailItem label="Dose" value={formatPrescriptionDosage(prescription)} />
        <DetailItem label="Frequência" value={prescription.frequency} />
        <DetailItem
          label="Intervalo"
          value={formatInterval(prescription.intervalHours)}
        />
        <DetailItem label="Prescritor" value={prescription.prescribedBy} />
        <DetailItem
          label="Primeiro horário"
          value={formatDateTime(prescription.firstScheduledAt)}
        />
        <DetailItem
          label="Período"
          value={formatDateRange(prescription.startDate, prescription.endDate)}
        />
        <DetailItem
          label="Criada em"
          value={formatShortDate(prescription.createdAt)}
        />
        <DetailItem
          label="Atualizada em"
          value={formatShortDate(prescription.updatedAt)}
        />
      </div>

      {!prescription.endDate ? (
        <div className="dashboard-context-note" role="note">
          Sem data final: o backend gera uma janela inicial de 7 dias de
          administrações.
        </div>
      ) : null}

      <div className="dashboard-form-actions">
        <button
          className="dashboard-button dashboard-button-muted"
          disabled={isMutating}
          type="button"
          onClick={onEdit}
        >
          Editar
        </button>
        <button
          className="dashboard-button dashboard-button-danger"
          disabled={isMutating}
          type="button"
          onClick={onDeactivate}
        >
          Desativar
        </button>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="dashboard-detail-item">
      <span>{label}</span>
      <strong>{value || "Não informado"}</strong>
    </div>
  );
}

function formatInterval(intervalHours) {
  if (!intervalHours) {
    return "Não informado";
  }

  return `${intervalHours}h`;
}
