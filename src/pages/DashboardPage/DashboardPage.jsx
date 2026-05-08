import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, removeSession } from "../../utils/storage";
import "./DashboardPage.css";

const menuItems = [
  "Início",
  "Residentes",
  "Prescrições",
  "Administração de medicamentos",
  "Medicamentos",
  "Equipe",
  "Condições de saúde",
  "Família / Acessos",
  "Empresa",
  "Relatórios",
  "Configurações",
];

function DashboardPage() {
  const navigate = useNavigate();
  const user = getUser();
  const [activeItem, setActiveItem] = useState("Início");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pageTitle = activeItem === "Início" ? "Dashboard" : activeItem;
  const displayName = user?.fullName || user?.email || "Administrador";
  const displayRole = user?.role === "admin" ? "Administrador" : "Usuário";
  const initials = getInitials(displayName);

  function handleMenuSelect(item) {
    setActiveItem(item);
    setIsMenuOpen(false);
  }

  function handleLogout() {
    removeSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="dashboard-shell">
      <button
        className={`dashboard-menu-backdrop${isMenuOpen ? " is-visible" : ""}`}
        type="button"
        aria-label="Fechar menu"
        onClick={() => setIsMenuOpen(false)}
      />

      <aside
        className={`dashboard-sidebar${isMenuOpen ? " is-open" : ""}`}
        aria-label="Menu administrativo"
      >
        <div className="dashboard-sidebar-header">
          <Link className="dashboard-logo" to="/" aria-label="ZeloTech">
            Zelo<span>Tech</span>
          </Link>
          <span className="dashboard-sidebar-label">Admin</span>
        </div>

        <nav className="dashboard-menu" aria-label="Seções do painel">
          {menuItems.map((item) => {
            const isActive = activeItem === item;

            return (
              <button
                aria-current={isActive ? "page" : undefined}
                className={`dashboard-menu-item${isActive ? " is-active" : ""}`}
                key={item}
                type="button"
                onClick={() => handleMenuSelect(item)}
              >
                <span className="dashboard-menu-icon" aria-hidden="true">
                  <MenuItemIcon />
                </span>
                <span>{item}</span>
              </button>
            );
          })}
        </nav>

        <div className="dashboard-sidebar-footer">
          <span className="dashboard-status-dot" aria-hidden="true" />
          <span>em breve</span>
        </div>
      </aside>

      <div className="dashboard-main-shell">
        <header className="dashboard-topbar">
          <div className="dashboard-title-group">
            <button
              className="dashboard-menu-toggle"
              type="button"
              aria-label="Abrir menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(true)}
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
              <input type="search" placeholder="Buscar no sistema" />
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
                <button type="button" onClick={handleLogout}>
                  Sair
                </button>
              </div>
            </details>
          </div>
        </header>

        <main className="dashboard-content">
          <section className="dashboard-hero">
            <div>
              <span className="overline">Início</span>
              <h2>Visão geral da instituição</h2>
            </div>
            <div className="dashboard-hero-placeholder">em breve</div>
          </section>

          <section
            className="dashboard-overview-grid"
            aria-label="Resumo do painel"
          >
            <article className="dashboard-card">
              <span>Residentes</span>
              <strong>em breve</strong>
            </article>
            <article className="dashboard-card">
              <span>Prescrições</span>
              <strong>em breve</strong>
            </article>
            <article className="dashboard-card">
              <span>Administrações</span>
              <strong>em breve</strong>
            </article>
            <article className="dashboard-card">
              <span>Equipe</span>
              <strong>em breve</strong>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}

function getInitials(displayName) {
  return displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="m21 21-4.3-4.3" />
      <circle cx="11" cy="11" r="7" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

function MenuItemIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 9h8" />
      <path d="M8 13h6" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default DashboardPage;
