import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";

export function DashboardShell({
  activeItem,
  children,
  displayName,
  displayRole,
  initials,
  isMenuOpen,
  onCloseMenu,
  onLogout,
  onMenuSelect,
  onOpenMenu,
  onSearchChange,
  pageTitle,
  searchTerm,
}) {
  return (
    <div className="dashboard-shell">
      <button
        className={`dashboard-menu-backdrop${isMenuOpen ? " is-visible" : ""}`}
        type="button"
        aria-label="Fechar menu"
        onClick={onCloseMenu}
      />

      <DashboardSidebar
        activeItem={activeItem}
        isMenuOpen={isMenuOpen}
        onMenuSelect={onMenuSelect}
      />

      <div className="dashboard-main-shell">
        <DashboardTopbar
          displayName={displayName}
          displayRole={displayRole}
          initials={initials}
          isMenuOpen={isMenuOpen}
          onLogout={onLogout}
          onOpenMenu={onOpenMenu}
          onSearchChange={onSearchChange}
          pageTitle={pageTitle}
          searchTerm={searchTerm}
        />

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
