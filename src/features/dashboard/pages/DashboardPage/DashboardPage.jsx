import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardShell } from "@/features/dashboard/layout/DashboardShell";
import { FamilyAccessView } from "@/features/family-access/components/FamilyAccessView";
import { DashboardHome } from "@/features/dashboard/components/home/DashboardHome";
import { MedicationAdministrationsView } from "@/features/medication-administrations/components/MedicationAdministrationsView";
import { MedicationsView } from "@/features/medications/components/MedicationsView";
import { PrescriptionsView } from "@/features/prescriptions/components/PrescriptionsView";
import { ResidentsView } from "@/features/residents/components/ResidentsView";
import { useCurrentTime } from "@/features/dashboard/hooks/useCurrentTime";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { useResidentOverview } from "@/features/residents/hooks/useResidentOverview";
import { buildDashboardSummary } from "@/features/dashboard/utils/dashboardSummary";
import { getUser, removeSession } from "@/features/auth/utils/session";
import { getInitials } from "@/shared/utils/nameFormatter";
import "./DashboardPage.css";

function DashboardPage() {
  const navigate = useNavigate();
  const storedUser = getUser();
  const [activeItem, setActiveItem] = useState("Início");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResidentId, setSelectedResidentId] = useState("");
  const currentTime = useCurrentTime();
  const { dashboardData, isLoading, loadError, setDashboardData } =
    useDashboardData();
  const pageTitle = activeItem === "Início" ? "Dashboard" : activeItem;

  const profile = dashboardData.profile;
  const displayName =
    profile?.fullName || storedUser?.fullName || storedUser?.email || "Administrador";
  const displayRole =
    (profile?.role || storedUser?.role) === "admin" ? "Administrador" : "Usuário";
  const isAdmin = (profile?.role || storedUser?.role) === "admin";
  const companyName =
    profile?.company?.tradeName ||
    profile?.company?.legalName ||
    "Instituição ZeloTech";
  const isCompanyActive = profile?.company?.isActive !== false;
  const initials = getInitials(displayName);

  const dashboardSummary = useMemo(
    () => buildDashboardSummary(dashboardData, searchTerm, currentTime),
    [currentTime, dashboardData, searchTerm],
  );
  const {
    selectedOverviewStatus,
    selectedResidentOverview,
    visibleSelectedResidentId,
  } = useResidentOverview({
    enabled: activeItem === "Residentes",
    filteredResidents: dashboardSummary.filteredResidents,
    selectedResidentId,
  });

  function handleMenuSelect(item) {
    setActiveItem(item);
    setIsMenuOpen(false);
  }

  function handleLogout() {
    removeSession();
    navigate("/login", { replace: true });
  }

  function handlePrescriptionsChange(prescriptions) {
    setDashboardData((currentData) => ({
      ...currentData,
      prescriptions,
    }));
  }

  function handleMedicationsChange(medications) {
    setDashboardData((currentData) => ({
      ...currentData,
      medications,
    }));
  }

  function handleAdministrationsChange(administrations) {
    setDashboardData((currentData) => ({
      ...currentData,
      administrations,
    }));
  }

  return (
    <DashboardShell
      activeItem={activeItem}
      displayName={displayName}
      displayRole={displayRole}
      initials={initials}
      isMenuOpen={isMenuOpen}
      onCloseMenu={() => setIsMenuOpen(false)}
      onLogout={handleLogout}
      onMenuSelect={handleMenuSelect}
      onOpenMenu={() => setIsMenuOpen(true)}
      onSearchChange={setSearchTerm}
      pageTitle={pageTitle}
      searchTerm={searchTerm}
    >
      {loadError ? (
        <div className="dashboard-alert" role="status">
          <span className="dashboard-alert-icon" aria-hidden="true">
            !
          </span>
          <span>{loadError}</span>
        </div>
      ) : null}

      {activeItem === "Residentes" ? (
        <ResidentsView
          administrations={dashboardData.administrations}
          currentTime={currentTime}
          isLoading={isLoading}
          onSelectResident={setSelectedResidentId}
          overview={selectedResidentOverview}
          overviewStatus={selectedOverviewStatus}
          prescriptions={dashboardData.prescriptions}
          residents={dashboardSummary.filteredResidents}
          selectedResidentId={visibleSelectedResidentId}
          allResidents={dashboardData.residents}
        />
      ) : activeItem === "Prescrições" ? (
        <PrescriptionsView
          currentTime={currentTime}
          isLoading={isLoading}
          medications={dashboardData.medications}
          prescriptions={dashboardData.prescriptions}
          residents={dashboardData.residents}
          searchTerm={searchTerm}
          onPrescriptionsChange={handlePrescriptionsChange}
        />
      ) : activeItem === "Administração de medicamentos" ? (
        <MedicationAdministrationsView
          administrations={dashboardData.administrations}
          currentTime={currentTime}
          isAdmin={isAdmin}
          isLoading={isLoading}
          prescriptions={dashboardData.prescriptions}
          residents={dashboardData.residents}
          searchTerm={searchTerm}
          onAdministrationsChange={handleAdministrationsChange}
        />
      ) : activeItem === "Medicamentos" ? (
        <MedicationsView
          isAdmin={isAdmin}
          isLoading={isLoading}
          medications={dashboardData.medications}
          searchTerm={searchTerm}
          onMedicationsChange={handleMedicationsChange}
        />
      ) : activeItem === "Família / Acessos" ? (
        <FamilyAccessView
          currentTime={currentTime}
          isLoading={isLoading}
          residents={dashboardData.residents}
          searchTerm={searchTerm}
        />
      ) : (
        <DashboardHome
          companyName={companyName}
          currentTime={currentTime}
          dashboardData={dashboardData}
          dashboardSummary={dashboardSummary}
          isCompanyActive={isCompanyActive}
          isLoading={isLoading}
        />
      )}
    </DashboardShell>
  );
}

export default DashboardPage;
