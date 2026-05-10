import { formatDate } from "@/shared/utils/dateFormatter";
import { AlertList } from "./AlertList";
import { MedicationSchedule } from "./MedicationSchedule";
import { PrescriptionList } from "./PrescriptionList";
import { ResidentList } from "./ResidentList";
import { StatusDistribution } from "./StatusDistribution";
import { LoadingRows } from "@/shared/ui/LoadingRows";
import { MetricCard } from "@/shared/ui/MetricCard";
import { PanelHeader } from "@/shared/ui/PanelHeader";

export function DashboardHome({
  companyName,
  currentTime,
  dashboardData,
  dashboardSummary,
  isCompanyActive,
  isLoading,
  onOpenAdministration,
}) {
  const hasLateAdministrations =
    !isLoading && dashboardSummary.lateAdministrations > 0;
  const lateAdministrationLabel =
    dashboardSummary.lateAdministrations === 1
      ? "administração atrasada"
      : "administrações atrasadas";

  return (
    <>
      {hasLateAdministrations ? (
        <section className="dashboard-critical-alert" role="alert">
          <span className="dashboard-critical-alert-icon" aria-hidden="true">
            !
          </span>
          <div className="dashboard-critical-alert-copy">
            <span>Prioridade agora</span>
            <strong>
              {dashboardSummary.lateAdministrations} {lateAdministrationLabel}
            </strong>
            <p>
              Revise a agenda de hoje e confirme com a equipe antes de seguir
              para outras pendências.
            </p>
          </div>
          <a
            className="dashboard-critical-alert-action"
            href="#dashboard-today-schedule"
          >
            Ver agenda
          </a>
        </section>
      ) : null}

      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="overline">Início</span>
          <h2>{companyName}</h2>
          <p>
            Hoje há {dashboardSummary.totalAdministrations}{" "}
            {dashboardSummary.totalAdministrations === 1
              ? "administração"
              : "administrações"}{" "}
            na agenda, com {dashboardSummary.pendingAdministrations} pendente
            {dashboardSummary.pendingAdministrations === 1 ? "" : "s"} e{" "}
            {dashboardSummary.lateAdministrations} em atraso.
          </p>
        </div>

        <div className="dashboard-hero-status" aria-label="Status do dia">
          <span
            className={`dashboard-company-status${
              isCompanyActive ? " is-active" : " is-inactive"
            }`}
          >
            {isCompanyActive ? "Empresa ativa" : "Empresa inativa"}
          </span>
          <strong>{formatDate(currentTime ? new Date(currentTime) : null)}</strong>
          <span>{dashboardSummary.completionRate}% da agenda concluída</span>
        </div>
      </section>

      <section className="dashboard-overview-grid" aria-label="Resumo do painel">
        <MetricCard
          label="Residentes ativos"
          value={dashboardData.residents.length}
          detail={`${dashboardSummary.recentResidents.length} admissões recentes`}
          loading={isLoading}
        />
        <MetricCard
          label="Prescrições ativas"
          value={dashboardData.prescriptions.length}
          detail={`${dashboardSummary.endingSoonPrescriptions.length} encerrando em 7 dias`}
          loading={isLoading}
        />
        <MetricCard
          label="Medicamentos"
          value={dashboardData.medications.length}
          detail="cadastro ativo da empresa"
          loading={isLoading}
        />
        <MetricCard
          label="Pendências de hoje"
          value={dashboardSummary.pendingAdministrations}
          detail={`${dashboardSummary.lateAdministrations} em atraso`}
          tone={dashboardSummary.lateAdministrations > 0 ? "danger" : "success"}
          loading={isLoading}
        />
      </section>

      <section className="dashboard-work-grid">
        <section
          className="dashboard-panel dashboard-panel-large"
          id="dashboard-today-schedule"
        >
          <PanelHeader
            overline="Agenda"
            title="Medicações de hoje"
            action={`${dashboardSummary.filteredAdministrations.length} itens`}
          />

          {isLoading ? (
            <LoadingRows />
          ) : (
            <MedicationSchedule
              administrations={dashboardSummary.filteredAdministrations}
              currentTime={currentTime}
              onOpenAdministration={onOpenAdministration}
            />
          )}
        </section>

        <section className="dashboard-panel">
          <PanelHeader
            overline="Prioridade"
            title="Alertas"
            action={`${dashboardSummary.alerts.length} sinais`}
          />

          {isLoading ? (
            <LoadingRows compact />
          ) : (
            <AlertList alerts={dashboardSummary.alerts} />
          )}
        </section>
      </section>

      <section className="dashboard-work-grid">
        <section className="dashboard-panel">
          <PanelHeader overline="Operação" title="Status da agenda" />
          <StatusDistribution
            total={dashboardSummary.totalAdministrations}
            statusCounts={dashboardSummary.statusCounts}
          />
        </section>

        <section className="dashboard-panel">
          <PanelHeader
            overline="Prescrições"
            title="Acompanhamento"
            action={`${dashboardSummary.filteredPrescriptions.length} ativas`}
          />
          <PrescriptionList prescriptions={dashboardSummary.filteredPrescriptions} />
        </section>

        <section className="dashboard-panel">
          <PanelHeader
            overline="Residentes"
            title="Admissões recentes"
            action={`${dashboardSummary.filteredResidents.length} ativos`}
          />
          <ResidentList residents={dashboardSummary.filteredResidents} />
        </section>
      </section>
    </>
  );
}
