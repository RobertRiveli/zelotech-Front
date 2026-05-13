import { useState } from "react";
import {
  formatCpf,
  maskCpf,
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
import { ResidentAccessCodeList } from "./ResidentAccessCodeList";
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
  accessCodes,
  accessCodesStatus,
  currentTime,
  isAdmin,
  isDeleting,
  isGeneratingAccess,
  isSubmitting,
  overview,
  overviewStatus,
  onDelete,
  onEdit,
  onCopyAccessCode,
  onGenerateAccess,
  resident,
}) {
  const [activeTabState, setActiveTabState] = useState({
    residentId: "",
    tab: "summary",
  });
  const [visibleCpfState, setVisibleCpfState] = useState({
    residentId: "",
    isVisible: false,
  });
  const displayResident = overview?.resident ?? resident;
  const activeTab =
    activeTabState.residentId === displayResident?.id
      ? activeTabState.tab
      : "summary";
  const isCpfVisible =
    visibleCpfState.residentId === displayResident?.id && visibleCpfState.isVisible;
  const healthConditions = overview?.healthConditions ?? [];
  const prescriptions = overview?.prescriptions ?? [];
  const administrations = overview?.administrations ?? [];
  const visibleAccessCodes = accessCodes ?? [];
  const isAccessCodesLoading = accessCodesStatus?.isLoading ?? false;
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

  if (isAdmin) {
    tabs.push({
      id: "access-codes",
      label: "Códigos",
      count: visibleAccessCodes.length,
    });
  }

  if (!displayResident && overviewStatus.isLoading) {
    return <LoadingRows />;
  }

  if (!displayResident) {
    return <EmptyState title="Nenhum residente selecionado." />;
  }

  function handleCpfVisibilityToggle() {
    setVisibleCpfState((currentState) => ({
      residentId: displayResident.id,
      isVisible:
        currentState.residentId === displayResident.id
          ? !currentState.isVisible
          : true,
    }));
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
                value={
                  displayResident.cpf ? (
                    <SensitiveCpfValue
                      cpf={displayResident.cpf}
                      isVisible={isCpfVisible}
                      onToggle={handleCpfVisibilityToggle}
                    />
                  ) : (
                    "Não informado"
                  )
                }
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

        {activeTab === "access-codes" && isAdmin ? (
          <ResidentDetailSection
            action={`${visibleAccessCodes.length} ativos`}
            title="Códigos de acesso"
          >
            {accessCodesStatus?.error ? (
              <div className="resident-inline-alert" role="status">
                {accessCodesStatus.error}
              </div>
            ) : null}

            <div className="resident-access-code-actions">
              <button
                className="dashboard-button dashboard-button-primary"
                disabled={isGeneratingAccess}
                type="button"
                onClick={onGenerateAccess}
              >
                {isGeneratingAccess ? "Gerando..." : "Gerar código"}
              </button>
            </div>

            {isAccessCodesLoading ? (
              <LoadingRows compact />
            ) : (
              <ResidentAccessCodeList
                accessCodes={visibleAccessCodes}
                onCopy={onCopyAccessCode}
              />
            )}
          </ResidentDetailSection>
        ) : null}
      </section>

      {isAdmin && activeTab === "summary" ? (
        <div className="dashboard-form-actions resident-overview-actions">
          <button
            className="dashboard-button dashboard-button-muted"
            disabled={isSubmitting}
            type="button"
            onClick={onEdit}
          >
            Editar
          </button>
          <button
            className="dashboard-button dashboard-button-muted"
            disabled={isGeneratingAccess}
            type="button"
            onClick={onGenerateAccess}
          >
            Gerar código
          </button>
          <button
            className="dashboard-button dashboard-button-danger"
            disabled={isDeleting}
            type="button"
            onClick={onDelete}
          >
            Excluir residente
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SensitiveCpfValue({ cpf, isVisible, onToggle }) {
  return (
    <span className="resident-sensitive-value">
      <span>{isVisible ? formatCpf(cpf) : maskCpf(cpf)}</span>
      <button
        aria-label={isVisible ? "Ocultar CPF" : "Revelar CPF"}
        aria-pressed={isVisible}
        className="resident-sensitive-toggle"
        type="button"
        onClick={onToggle}
      >
        {isVisible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </span>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="resident-sensitive-toggle-icon"
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      className="resident-sensitive-toggle-icon"
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path
        d="m3 3 18 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M10.6 5.2A10.5 10.5 0 0 1 12 5c6 0 9.5 7 9.5 7a17.3 17.3 0 0 1-3.1 4.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M14.1 14.1A3 3 0 0 1 9.9 9.9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M6.6 6.7C3.9 8.5 2.5 12 2.5 12s3.5 7 9.5 7c1.5 0 2.9-.4 4.1-1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
