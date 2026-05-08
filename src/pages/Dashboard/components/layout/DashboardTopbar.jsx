import { BellIcon } from "../../icons/BellIcon";
import { ChevronIcon } from "../../icons/ChevronIcon";
import { HamburgerIcon } from "../../icons/HamburgerIcon";
import { SearchIcon } from "../../icons/SearchIcon";

export function DashboardTopbar({
  displayName,
  displayRole,
  initials,
  isMenuOpen,
  onLogout,
  onOpenMenu,
  onSearchChange,
  pageTitle,
  searchTerm,
}) {
  return (
    <header className="dashboard-topbar">
      <div className="dashboard-title-group">
        <button
          className="dashboard-menu-toggle"
          type="button"
          aria-label="Abrir menu"
          aria-expanded={isMenuOpen}
          onClick={onOpenMenu}
        >
          <HamburgerIcon />
        </button>

        <div>
          <span className="dashboard-page-eyebrow">
            Painel administrativo
          </span>
          <h1>{pageTitle}</h1>
        </div>
      </div>

      <div className="dashboard-topbar-actions">
        <label className="dashboard-search">
          <span className="sr-only">Busca global</span>
          <SearchIcon />
          <input
            type="search"
            placeholder="Buscar residente ou medicamento"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <button
          className="dashboard-icon-button"
          type="button"
          aria-label="Notificações"
        >
          <BellIcon />
        </button>

        <details className="dashboard-profile">
          <summary aria-label="Abrir menu do perfil">
            <span className="dashboard-avatar" aria-hidden="true">
              {initials}
            </span>
            <span className="dashboard-profile-copy">
              <strong>{displayName}</strong>
              <span>{displayRole}</span>
            </span>
            <ChevronIcon />
          </summary>

          <div className="dashboard-profile-dropdown">
            <button type="button" onClick={onLogout}>
              Sair
            </button>
          </div>
        </details>
      </div>
    </header>
  );
}
