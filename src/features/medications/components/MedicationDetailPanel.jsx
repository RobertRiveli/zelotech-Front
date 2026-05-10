import { formatShortDate } from "@/shared/utils/dateFormatter";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingRows } from "@/shared/ui/LoadingRows";
import { PanelHeader } from "@/shared/ui/PanelHeader";
import { formatMedicationForm } from "@/features/medications/utils/medicationDashboardUtils";
import { getMedicationName } from "@/features/medications/utils/medicationFormatters";

export function MedicationDetailPanel({
  detailStatus,
  isAdmin,
  isMutating,
  medication,
  onDelete,
  onEdit,
}) {
  if (detailStatus.isLoading && !medication) {
    return <LoadingRows />;
  }

  if (!medication) {
    return <EmptyState title="Nenhum medicamento selecionado." />;
  }

  return (
    <div className="medication-detail">
      <PanelHeader overline="Detalhe" title={getMedicationName(medication)} />

      {detailStatus.error ? (
        <div
          className="dashboard-form-alert dashboard-form-alert-danger"
          role="status"
        >
          {detailStatus.error}
        </div>
      ) : null}

      <div className="medication-detail-summary">
        <div>
          <span>Forma farmacêutica</span>
          <strong>{formatMedicationForm(medication.form)}</strong>
        </div>
        <span className="dashboard-status-badge is-success">Ativo</span>
      </div>

      <div className="dashboard-detail-grid">
        <DetailItem label="Nome genérico" value={medication.genericName} />
        <DetailItem label="Marca" value={medication.brandName} />
        <DetailItem
          label="Forma"
          value={formatMedicationForm(medication.form)}
        />
        <DetailItem label="Dosagem" value={medication.strength} />
        <DetailItem
          label="Criado em"
          value={formatShortDate(medication.createdAt)}
        />
        <DetailItem
          label="Atualizado em"
          value={formatShortDate(medication.updatedAt)}
        />
      </div>

      {isAdmin ? (
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
            onClick={onDelete}
          >
            Excluir
          </button>
        </div>
      ) : (
        <div className="dashboard-context-note" role="note">
          Seu perfil permite consultar medicamentos, mas apenas administradores
          podem cadastrar, editar ou excluir.
        </div>
      )}
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
