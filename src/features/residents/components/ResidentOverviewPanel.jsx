import { useState } from "react";
import {
  formatCpf,
} from "@/shared/utils/cpfFormatter";
import {
  formatShortDate,
} from "@/shared/utils/dateFormatter";
import {
  formatGender,
  getAgeLabel,
  getResidentStatusLabel,
} from "@/features/residents/utils/residentFormatters";
import { buildResidentAdministrationSummary } from "@/features/residents/utils/residentDashboardUtils";
import { ResidentAdministrationDetails } from "./ResidentAdministrationDetails";
import { ResidentConditionList } from "./ResidentConditionList";
import { ResidentDetailSection } from "./ResidentDetailSection";
import { ResidentInfoItem } from "./ResidentInfoItem";
import { ResidentPrescriptionDetails } from "./ResidentPrescriptionDetails";
import { ResidentStatItem } from "./ResidentStatItem";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingRows } from "@/shared/ui/LoadingRows";
import { PanelHeader } from "@/shared/ui/PanelHeader";

export function ResidentOverviewPanel({
  currentTime,
  overview,
  overviewStatus,
  resident,
}) {
  const [activeTabState, setActiveTabState] = useState({
    residentId: "",
    tab: "summary",
  });
  const displayResident = overview?.resident ?? resident;
  const activeTab =
    activeTabState.residentId === displayResident?.id
      ? activeTabState.tab
      : "summary";
  const healthConditions = overview?.healthConditions ?? [];
  const prescriptions = overview?.prescriptions ?? [];
  const administrations = overview?.administrations ?? [];
  const isOverviewLoading = overviewStatus.isLoading && !overview;
  const administrationSummary = displayResident
    ? buildResidentAdministrationSummary(
        displayResident.id,
        administrations,
        currentTime,
      )
    : { pending: 0, late: 0 };
  const tabs = [
    { id: "summary", label: "Resumo" },
    { id: "health", label: "Saúde", count: healthConditions.length },
    { id: "prescriptions", label: "Prescrições", count: prescriptions.length },
    { id: "administrations", label: "Administrações", count: administrations.length },
  ];

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

      <div className="resident-tabs" role="tablist" aria-label="Detalhes do residente">
        {tabs.map((tab) => (
          <button
            aria-controls={`resident-tab-panel-${tab.id}`}
            aria-selected={activeTab === tab.id}
            className="resident-tab-button"
            id={`resident-tab-${tab.id}`}
            key={tab.id}
            role="tab"
            type="button"
            onClick={() =>
              setActiveTabState({
                residentId: displayResident.id,
                tab: tab.id,
              })
            }
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" ? <small>{tab.count}</small> : null}
          </button>
        ))}
      </div>

      <section
        aria-labelledby={`resident-tab-${activeTab}`}
        className="resident-tab-panel"
        id={`resident-tab-panel-${activeTab}`}
        role="tabpanel"
        tabIndex={0}
      >
        {activeTab === "summary" ? (
          <>
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

            {isOverviewLoading ? (
              <LoadingRows compact />
            ) : (
              <div className="resident-stat-strip" aria-label="Resumo do prontuário">
                <ResidentStatItem
                  label="Condições"
                  value={healthConditions.length}
                />
                <ResidentStatItem label="Prescrições" value={prescriptions.length} />
                <ResidentStatItem label="Pendentes" value={administrationSummary.pending} />
                <ResidentStatItem label="Atrasadas" value={administrationSummary.late} />
              </div>
            )}
          </>
        ) : null}

        {activeTab !== "summary" && isOverviewLoading ? <LoadingRows compact /> : null}

        {activeTab === "health" && !isOverviewLoading ? (
          <ResidentDetailSection
            action={`${healthConditions.length} itens`}
            title="Condições de saúde"
          >
            <ResidentConditionList healthConditions={healthConditions} />
          </ResidentDetailSection>
        ) : null}

        {activeTab === "prescriptions" && !isOverviewLoading ? (
          <ResidentDetailSection
            action={`${prescriptions.length} ativas`}
            title="Prescrições"
          >
            <ResidentPrescriptionDetails prescriptions={prescriptions} />
          </ResidentDetailSection>
        ) : null}

        {activeTab === "administrations" && !isOverviewLoading ? (
          <ResidentDetailSection
            action={`${administrations.length} registros`}
            title="Administrações"
          >
            <ResidentAdministrationDetails
              administrations={administrations}
              currentTime={currentTime}
            />
          </ResidentDetailSection>
        ) : null}
      </section>
    </div>
  );
}
