import { buildResidentsStats } from "../../utils/residentDashboardUtils";
import { ResidentsDirectory } from "./ResidentsDirectory";
import { ResidentOverviewPanel } from "./ResidentOverviewPanel";
import { MetricCard } from "../shared/MetricCard";
import { PanelHeader } from "../shared/PanelHeader";

export function ResidentsView({
  administrations,
  allResidents,
  currentTime,
  isLoading,
  onSelectResident,
  overview,
  overviewStatus,
  prescriptions,
  residents,
  selectedResidentId,
}) {
  const residentsStats = buildResidentsStats({
    administrations,
    allResidents,
    currentTime,
  });
  const selectedResident =
    overview?.resident ??
    residents.find((resident) => resident.id === selectedResidentId) ??
    allResidents.find((resident) => resident.id === selectedResidentId) ??
    null;

  return (
    <>
      <section className="dashboard-hero residents-hero">
        <div className="dashboard-hero-copy">
          <span className="overline">Residentes</span>
          <h2>Acompanhamento dos residentes ativos</h2>
          <p>
            Lista operacional da instituição com dados cadastrais, prescrições
            ativas, pendências de medicação e visão geral do prontuário.
          </p>
        </div>

        <div className="dashboard-hero-status" aria-label="Resumo de residentes">
          <span className="dashboard-company-status is-active">
            Cadastro ativo
          </span>
          <strong>{residentsStats.totalResidents} residentes</strong>
          <span>{residentsStats.recentAdmissions} admissões recentes</span>
        </div>
      </section>

      <section className="dashboard-overview-grid" aria-label="Resumo de residentes">
        <MetricCard
          label="Residentes ativos"
          value={residentsStats.totalResidents}
          detail={`${residents.length} visíveis na busca`}
          loading={isLoading}
        />
        <MetricCard
          label="Com tipo sanguíneo"
          value={residentsStats.withBloodType}
          detail="informado no cadastro"
          loading={isLoading}
        />
        <MetricCard
          label="Prescrições ativas"
          value={prescriptions.length}
          detail="vinculadas aos residentes"
          loading={isLoading}
        />
        <MetricCard
          label="Pendências de hoje"
          value={residentsStats.pendingAdministrations}
          detail={`${residentsStats.lateAdministrations} em atraso`}
          tone={residentsStats.lateAdministrations > 0 ? "danger" : "success"}
          loading={isLoading}
        />
      </section>

      <section className="residents-layout">
        <section className="dashboard-panel residents-list-panel">
          <PanelHeader
            overline="Lista"
            title="Residentes ativos"
            action={`${residents.length} encontrados`}
          />
          <ResidentsDirectory
            administrations={administrations}
            currentTime={currentTime}
            isLoading={isLoading}
            onSelectResident={onSelectResident}
            prescriptions={prescriptions}
            residents={residents}
            selectedResidentId={selectedResidentId}
          />
        </section>

        <section className="dashboard-panel residents-detail-panel">
          <ResidentOverviewPanel
            currentTime={currentTime}
            overview={overview}
            overviewStatus={overviewStatus}
            resident={selectedResident}
          />
        </section>
      </section>
    </>
  );
}
