import {
  formatDateTime,
  formatShortDateTime,
} from "@/shared/utils/dateFormatter";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingRows } from "@/shared/ui/LoadingRows";
import { AdministrationStatusBadge } from "./AdministrationStatusBadge";
import { AdministrationModalShell } from "./AdministrationModalShell";
import {
  getAdministrationDisplayStatus,
  isPendingAdministration,
} from "@/features/medication-administrations/utils/administrationDashboardUtils";
import {
  getDosage,
  getMedicationName,
} from "@/features/medications/utils/medicationFormatters";

export function AdministrationDetailModal({
  administration,
  currentTime,
  detailStatus,
  isAdmin,
  isMutating,
  onAction,
  onClose,
}) {
  const displayStatus = administration
    ? getAdministrationDisplayStatus(administration, currentTime)
    : "PENDING";
  const isPending = administration ? isPendingAdministration(administration) : false;

  return (
    <AdministrationModalShell
      overline="Detalhe"
      title="Administração de medicamento"
      footer={
        administration ? (
          <DetailActions
            administration={administration}
            isAdmin={isAdmin}
            isMutating={isMutating}
            isPending={isPending}
            onAction={onAction}
          />
        ) : null
      }
      onClose={onClose}
    >
      {detailStatus.isLoading && !administration ? <LoadingRows /> : null}

      {!detailStatus.isLoading && !administration ? (
        <EmptyState title="Nenhuma administração selecionada." />
      ) : null}

      {administration ? (
        <div className="administration-detail">
          {detailStatus.error ? (
            <div
              className="dashboard-form-alert dashboard-form-alert-danger"
              role="status"
            >
              {detailStatus.error}
            </div>
          ) : null}

          <div className="administration-detail-summary">
            <div>
              <span>{formatDateTime(administration.scheduledAt)}</span>
              <strong>{administration.resident?.fullName ?? "Residente"}</strong>
            </div>
            <AdministrationStatusBadge status={displayStatus} />
          </div>

          <div className="administration-detail-sections">
            <DetailSection title="Dose">
              <DetailItem
                label="Medicamento"
                value={getMedicationName(administration.medication)}
              />
              <DetailItem label="Dose" value={getDosage(administration)} />
              <DetailItem
                label="Unidade"
                value={
                  administration.measurementUnit?.name ??
                  administration.measurementUnit?.abbreviation
                }
              />
            </DetailSection>

            <DetailSection title="Prescrição">
              <DetailItem
                label="Via"
                value={administration.prescription?.route}
              />
              <DetailItem
                label="Frequência"
                value={administration.prescription?.frequency}
              />
            </DetailSection>

            <DetailSection title="Registro">
              <DetailItem
                label="Horário previsto"
                value={formatShortDateTime(administration.scheduledAt)}
              />
              <DetailItem
                label="Horário administrado"
                value={formatShortDateTime(
                  administration.administeredAt,
                  "Ainda não administrada",
                )}
              />
              <DetailItem
                label="Cuidador"
                value={
                  administration.caregiver?.fullName ??
                  administration.caregiver?.name
                }
              />
              <DetailItem
                label="Criado em"
                value={formatShortDateTime(administration.createdAt)}
              />
              <DetailItem
                label="Atualizado em"
                value={formatShortDateTime(administration.updatedAt)}
              />
            </DetailSection>

            <DetailSection title="Ocorrência">
              <DetailItem label="Observações" value={administration.notes} />
              <DetailItem label="Justificativa" value={administration.reason} />
            </DetailSection>
          </div>
        </div>
      ) : null}
    </AdministrationModalShell>
  );
}

function DetailActions({
  administration,
  isAdmin,
  isMutating,
  isPending,
  onAction,
}) {
  if (!isPending) {
    return null;
  }

  return (
    <div className="dashboard-form-actions administration-detail-actions">
      <button
        className="dashboard-button dashboard-button-primary"
        disabled={isMutating}
        type="button"
        onClick={() => onAction("administer", administration)}
      >
        Administrar
      </button>
      <button
        className="dashboard-button dashboard-button-muted"
        disabled={isMutating}
        type="button"
        onClick={() => onAction("refuse", administration)}
      >
        Recusar
      </button>
      <button
        className="dashboard-button dashboard-button-muted"
        disabled={isMutating}
        type="button"
        onClick={() => onAction("miss", administration)}
      >
        Perdida
      </button>
      {isAdmin ? (
        <button
          className="dashboard-button dashboard-button-danger"
          disabled={isMutating}
          type="button"
          onClick={() => onAction("cancel", administration)}
        >
          Cancelar
        </button>
      ) : null}
    </div>
  );
}

function DetailSection({ children, title }) {
  return (
    <section className="administration-detail-section">
      <h3>{title}</h3>
      <div className="administration-detail-section-grid">{children}</div>
    </section>
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
