import { Link } from "react-router-dom";
import { dashboardMenuItems } from "@/features/dashboard/constants/dashboardMenuItems";
import { MenuItemIcon } from "@/features/dashboard/icons/MenuItemIcon";

export function DashboardSidebar({
  activeItem,
  isMenuOpen,
  menuItems = dashboardMenuItems,
  onMenuSelect,
}) {
  return (
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
              onClick={() => onMenuSelect(item)}
            >
              <span className="dashboard-menu-icon" aria-hidden="true">
                <MenuItemIcon item={item} />
              </span>
              <span>{item}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
