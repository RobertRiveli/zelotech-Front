import {
  formatCpf,
  formatGender,
  formatShortDate,
  getAgeLabel,
  getResidentStatusLabel,
} from "../../utils/dashboardFormatters";
import { buildResidentAdministrationSummary } from "../../utils/residentDashboardUtils";
import { ResidentAdministrationDetails } from "./ResidentAdministrationDetails";
import { ResidentConditionList } from "./ResidentConditionList";
import { ResidentDetailSection } from "./ResidentDetailSection";
import { ResidentInfoItem } from "./ResidentInfoItem";
import { ResidentPrescriptionDetails } from "./ResidentPrescriptionDetails";
import { ResidentStatItem } from "./ResidentStatItem";
import { EmptyState } from "../shared/EmptyState";
import { LoadingRows } from "../shared/LoadingRows";
import { PanelHeader } from "../shared/PanelHeader";

export function ResidentOverviewPanel({
  currentTime,
  overview,
  overviewStatus,
  resident,
}) {
  const displayResident = overview?.resident ?? resident;
  const healthConditions = overview?.healthConditions ?? [];
  const prescriptions = overview?.prescriptions ?? [];
  const administrations = overview?.administrations ?? [];
  const administrationSummary = displayResident
    ? buildResidentAdministrationSummary(
        displayResident.id,
        administrations,
        currentTime,
      )
    : { pending: 0, late: 0 };

  if (!displayResident && overviewStatus.isLoading) {
    return <LoadingRows />;
  }

  if (!displayResident) {
    return <EmptyState title="Nenhum residente selecionado." />;
  }

  return (
    <div className="resident-overview">
      <PanelHeader
        overline="Prontuário"
        title={displayResident.fullName}
        action={getAgeLabel(displayResident, currentTime)}
      />

      {overviewStatus.error ? (
        <div className="resident-inline-alert" role="status">
          {overviewStatus.error}
        </div>
      ) : null}

      <div className="resident-profile-grid">
        <ResidentInfoItem
          label="CPF"
          value={displayResident.cpf ? formatCpf(displayResident.cpf) : "Não informado"}
        />
        <ResidentInfoItem
          label="Nascimento"
          value={formatShortDate(displayResident.birthDate)}
        />
        <ResidentInfoItem
          label="Admissão"
          value={formatShortDate(displayResident.admissionDate)}
        />
        <ResidentInfoItem
          label="Tipo sanguíneo"
          value={displayResident.bloodType ?? "Não informado"}
        />
        <ResidentInfoItem
          label="Gênero"
          value={formatGender(displayResident.gender)}
        />
        <ResidentInfoItem
          label="Status"
          value={getResidentStatusLabel(displayResident.status)}
        />
      </div>

      {overviewStatus.isLoading && !overview ? (
        <LoadingRows compact />
      ) : (
        <>
          <div className="resident-stat-strip" aria-label="Resumo do prontuário">
            <ResidentStatItem
              label="Condições"
              value={healthConditions.length}
            />
            <ResidentStatItem label="Prescrições" value={prescriptions.length} />
            <ResidentStatItem label="Pendentes" value={administrationSummary.pending} />
            <ResidentStatItem label="Atrasadas" value={administrationSummary.late} />
          </div>

          <ResidentDetailSection
            action={`${healthConditions.length} itens`}
            title="Condições de saúde"
          >
            <ResidentConditionList healthConditions={healthConditions} />
          </ResidentDetailSection>

          <ResidentDetailSection
            action={`${prescriptions.length} ativas`}
            title="Prescrições"
          >
            <ResidentPrescriptionDetails prescriptions={prescriptions} />
          </ResidentDetailSection>

          <ResidentDetailSection
            action={`${administrations.length} registros`}
            title="Administrações"
          >
            <ResidentAdministrationDetails
              administrations={administrations}
              currentTime={currentTime}
            />
          </ResidentDetailSection>
        </>
      )}
    </div>
  );
}
