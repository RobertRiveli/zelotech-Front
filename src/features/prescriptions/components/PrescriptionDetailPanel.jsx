import {
  formatDateRange,
  formatDateTime,
  formatShortDate,
} from "@/shared/utils/dateFormatter";
import { getMedicationName } from "@/features/medications/utils/medicationFormatters";
import { formatPrescriptionDosage } from "@/features/prescriptions/utils/prescriptionFormatters";
import { getPrescriptionStatus } from "@/features/prescriptions/utils/prescriptionDashboardUtils";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingRows } from "@/shared/ui/LoadingRows";
import { PanelHeader } from "@/shared/ui/PanelHeader";

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
  const residentName = prescription.resident?.fullName ?? "Prescrição";
  const medicationName = getMedicationName(prescription.medication);

  return (
    <div className="prescription-detail">
      <PanelHeader
        overline="Detalhe"
        title={residentName}
        action={status.label}
      />

      {detailStatus.error ? (
        <div className="resident-inline-alert" role="status">
          {detailStatus.error}
        </div>
      ) : null}

      <div className="prescription-detail-summary">
        <div className="prescription-detail-summary-main">
          <span>Plano medicamentoso</span>
          <strong>{medicationName}</strong>
          <small>{residentName}</small>
        </div>
        <span className={`dashboard-status-badge is-${status.tone}`}>
          {status.label}
        </span>
      </div>

      <div className="dashboard-detail-grid prescription-clinical-grid">
        <DetailItem
          label="Dose"
          value={formatPrescriptionDosage(prescription)}
        />
        <DetailItem label="Frequência" value={prescription.frequency} />
        <DetailItem
          label="Intervalo"
          value={formatInterval(prescription.intervalHours)}
        />
        <DetailItem
          label="Primeiro horário"
          value={formatDateTime(prescription.firstScheduledAt)}
        />
      </div>

      <section className="prescription-detail-section">
        <h3>Responsável e período</h3>
        <div className="dashboard-detail-grid">
          <DetailItem label="Prescritor" value={prescription.prescribedBy} />
          <DetailItem
            label="Período"
            value={formatDateRange(prescription.startDate, prescription.endDate)}
          />
        </div>
      </section>

      <section className="prescription-detail-section prescription-detail-section-muted">
        <h3>Registro</h3>
        <div className="dashboard-detail-grid">
          <DetailItem
            label="Criada em"
            value={formatShortDate(prescription.createdAt)}
          />
          <DetailItem
            label="Atualizada em"
            value={formatShortDate(prescription.updatedAt)}
          />
        </div>
      </section>

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
