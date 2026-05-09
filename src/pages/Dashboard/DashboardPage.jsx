import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardShell } from "./components/layout/DashboardShell";
import { DashboardHome } from "./components/home/DashboardHome";
import { PrescriptionsView } from "./components/prescriptions/PrescriptionsView";
import { ResidentsView } from "./components/residents/ResidentsView";
import { useCurrentTime } from "./hooks/useCurrentTime";
import { useDashboardData } from "./hooks/useDashboardData";
import { useResidentOverview } from "./hooks/useResidentOverview";
import { buildDashboardSummary } from "./utils/dashboardSummary";
import { getInitials } from "./utils/dashboardFormatters";
import { getUser, removeSession } from "../../utils/storage";
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
    activeItem,
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
