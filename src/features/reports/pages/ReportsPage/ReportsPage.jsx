import { useState } from "react";
import { MedicationAdministrationReportView } from "@/features/reports/administrations/components/MedicationAdministrationReportView";
import { ResidentReportView } from "@/features/reports/residents/components/ResidentReportView";
import "./ReportsPage.css";

const reportSections = [
  {
    id: "administrations",
    label: "Administrações",
    title: "Administração de medicamentos",
    description: "Adesão, atrasos e ocorrências da rotina medicamentosa.",
  },
  {
    id: "residents",
    label: "Residente",
    title: "Histórico do residente",
    description: "Linha do tempo, prescrições ativas e condições vinculadas.",
  },
];

export function ReportsPage({
  administrations,
  currentTime,
  isLoading,
  medications,
  onOpenResident,
  prescriptions,
  residents,
  searchTerm,
}) {
  const [activeSection, setActiveSection] = useState("administrations");

  return (
    <>
      <section
        aria-label="Tipos de relatório"
        className="dashboard-panel report-section-nav"
      >
        <div className="report-section-header">
          <div className="report-section-copy">
            <span className="overline">Central de relatórios</span>
            <h2>Escolha o recorte operacional</h2>
          </div>

          <div
            aria-label="Tipos de relatório"
            className="report-section-tabs"
            role="tablist"
          >
            {reportSections.map((section) => (
              <button
                aria-controls={`report-section-panel-${section.id}`}
                aria-selected={activeSection === section.id}
                className={`report-section-tab${
                  activeSection === section.id ? " is-active" : ""
                }`}
                id={`report-section-tab-${section.id}`}
                key={section.id}
                role="tab"
                type="button"
                onClick={() => setActiveSection(section.id)}
              >
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="report-section-active-panels">
          {reportSections.map((section) => (
            <div
              aria-labelledby={`report-section-tab-${section.id}`}
              className="report-section-active"
              hidden={activeSection !== section.id}
              id={`report-section-panel-${section.id}`}
              key={section.id}
              role="tabpanel"
            >
              <span>{section.label}</span>
              <strong>{section.title}</strong>
              <small>{section.description}</small>
            </div>
          ))}
        </div>
      </section>

      {activeSection === "residents" ? (
        <ResidentReportView
          administrations={administrations}
          currentTime={currentTime}
          isLoading={isLoading}
          onOpenResident={onOpenResident}
          prescriptions={prescriptions}
          residents={residents}
          searchTerm={searchTerm}
        />
      ) : (
        <MedicationAdministrationReportView
          administrations={administrations}
          currentTime={currentTime}
          isLoading={isLoading}
          medications={medications}
          prescriptions={prescriptions}
          residents={residents}
          searchTerm={searchTerm}
        />
      )}
    </>
  );
}
