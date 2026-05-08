import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listTodayMedicationAdministrations } from "../../services/medicationAdministrationService";
import { listMedications } from "../../services/medicationService";
import { listPrescriptions } from "../../services/prescriptionService";
import { listResidents } from "../../services/residentService";
import { getProfile } from "../../services/userService";
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

const emptyDashboardData = {
  profile: null,
  residents: [],
  prescriptions: [],
  medications: [],
  administrations: [],
};

const statusLabels = {
  PENDING: "Pendente",
  ADMINISTERED: "Administrada",
  REFUSED: "Recusada",
  MISSED: "Perdida",
  CANCELED: "Cancelada",
};

const statusTone = {
  PENDING: "pending",
  ADMINISTERED: "success",
  REFUSED: "warning",
  MISSED: "danger",
  CANCELED: "muted",
};

function DashboardPage() {
  const navigate = useNavigate();
  const storedUser = getUser();
  const [activeItem, setActiveItem] = useState("Início");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dashboardData, setDashboardData] = useState(emptyDashboardData);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const pageTitle = activeItem === "Início" ? "Dashboard" : activeItem;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setLoadError("");

      const requests = [
        ["profile", getProfile()],
        ["residents", listResidents()],
        ["prescriptions", listPrescriptions()],
        ["medications", listMedications()],
        ["administrations", listTodayMedicationAdministrations()],
      ];

      const settledRequests = await Promise.allSettled(
        requests.map(([, request]) => request),
      );

      if (!isMounted) {
        return;
      }

      const nextData = { ...emptyDashboardData };
      const failedRequests = [];

      settledRequests.forEach((result, index) => {
        const [key] = requests[index];

        if (result.status === "fulfilled") {
          nextData[key] = result.value;
          return;
        }

        failedRequests.push(key);
      });

      setDashboardData(nextData);
      setIsLoading(false);

      if (failedRequests.length === requests.length) {
        setLoadError("Não foi possível carregar os dados do dashboard.");
        return;
      }

      if (failedRequests.length > 0) {
        setLoadError("Algumas informações não puderam ser carregadas agora.");
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

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
              <input
                type="search"
                placeholder="Buscar residente ou medicamento"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
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
                <button type="button" onClick={handleLogout}>
                  Sair
                </button>
              </div>
            </details>
          </div>
        </header>

        <main className="dashboard-content">
          {loadError ? (
            <div className="dashboard-alert" role="status">
              <span className="dashboard-alert-icon" aria-hidden="true">
                !
              </span>
              <span>{loadError}</span>
            </div>
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

          <section
            className="dashboard-overview-grid"
            aria-label="Resumo do painel"
          >
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
            <section className="dashboard-panel dashboard-panel-large">
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
              <PrescriptionList
                prescriptions={dashboardSummary.filteredPrescriptions}
              />
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
        </main>
      </div>
    </div>
  );
}

function MetricCard({ label, value, detail, tone = "default", loading = false }) {
  return (
    <article className={`dashboard-card dashboard-card-${tone}`}>
      <span>{label}</span>
      <strong>{loading ? "..." : value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function PanelHeader({ overline, title, action }) {
  return (
    <div className="dashboard-panel-header">
      <div>
        <span className="overline">{overline}</span>
        <h2>{title}</h2>
      </div>
      {action ? <span className="dashboard-panel-action">{action}</span> : null}
    </div>
  );
}

function MedicationSchedule({ administrations, currentTime }) {
  if (administrations.length === 0) {
    return (
      <EmptyState title="Nenhuma administração encontrada para hoje." />
    );
  }

  return (
    <div className="dashboard-schedule-list">
      {administrations.slice(0, 8).map((administration) => {
        const status = administration.status ?? "PENDING";
        const medicationName = getMedicationName(administration.medication);
        const scheduledAt = toDate(administration.scheduledAt);
        const isLate =
          status === "PENDING" &&
          scheduledAt &&
          currentTime > 0 &&
          scheduledAt.getTime() < currentTime;

        return (
          <article className="dashboard-schedule-item" key={administration.id}>
            <time dateTime={administration.scheduledAt}>
              {formatTime(scheduledAt)}
            </time>
            <div>
              <strong>{administration.resident?.fullName ?? "Residente"}</strong>
              <span>
                {medicationName} · {getDosage(administration)}
              </span>
            </div>
            <StatusBadge status={isLate ? "LATE" : status} />
          </article>
        );
      })}
    </div>
  );
}

function AlertList({ alerts }) {
  if (alerts.length === 0) {
    return <EmptyState title="Nenhum alerta crítico no momento." />;
  }

  return (
    <div className="dashboard-alert-list">
      {alerts.map((alert) => (
        <article className={`dashboard-alert-card is-${alert.tone}`} key={alert.id}>
          <span>{alert.label}</span>
          <strong>{alert.value}</strong>
          <small>{alert.detail}</small>
        </article>
      ))}
    </div>
  );
}

function StatusDistribution({ total, statusCounts }) {
  const statuses = ["PENDING", "ADMINISTERED", "REFUSED", "MISSED", "CANCELED"];

  if (total === 0) {
    return <EmptyState title="A agenda de hoje ainda não tem itens." />;
  }

  return (
    <div className="dashboard-status-list">
      {statuses.map((status) => {
        const count = statusCounts[status] ?? 0;
        const percentage = Math.round((count / total) * 100);

        return (
          <div className="dashboard-status-row" key={status}>
            <div>
              <span>{statusLabels[status]}</span>
              <strong>{count}</strong>
            </div>
            <div className="dashboard-status-track" aria-hidden="true">
              <span
                className={`is-${statusTone[status]}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PrescriptionList({ prescriptions }) {
  if (prescriptions.length === 0) {
    return <EmptyState title="Nenhuma prescrição ativa encontrada." />;
  }

  return (
    <div className="dashboard-compact-list">
      {prescriptions.slice(0, 5).map((prescription) => (
        <article className="dashboard-compact-item" key={prescription.id}>
          <div>
            <strong>{prescription.resident?.fullName ?? "Residente"}</strong>
            <span>
              {getMedicationName(prescription.medication)} · {prescription.frequency}
            </span>
          </div>
          <small>{formatDateRange(prescription.startDate, prescription.endDate)}</small>
        </article>
      ))}
    </div>
  );
}

function ResidentList({ residents }) {
  if (residents.length === 0) {
    return <EmptyState title="Nenhum residente ativo encontrado." />;
  }

  return (
    <div className="dashboard-compact-list">
      {residents.slice(0, 5).map((resident) => (
        <article className="dashboard-compact-item" key={resident.id}>
          <div>
            <strong>{resident.fullName}</strong>
            <span>
              {resident.bloodType ? `Tipo ${resident.bloodType}` : "Sem tipo sanguíneo"}
            </span>
          </div>
          <small>{formatShortDate(resident.admissionDate)}</small>
        </article>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "LATE") {
    return <span className="dashboard-status-badge is-danger">Atrasada</span>;
  }

  return (
    <span className={`dashboard-status-badge is-${statusTone[status] ?? "muted"}`}>
      {statusLabels[status] ?? status}
    </span>
  );
}

function EmptyState({ title }) {
  return <div className="dashboard-empty-state">{title}</div>;
}

function LoadingRows({ compact = false }) {
  return (
    <div className="dashboard-loading-list" aria-label="Carregando">
      {Array.from({ length: compact ? 3 : 5 }).map((_, index) => (
        <div className="dashboard-loading-row" key={index} />
      ))}
    </div>
  );
}

function buildDashboardSummary(data, searchTerm, currentTime) {
  const normalizedSearch = normalizeText(searchTerm);
  const administrations = [...data.administrations].sort(compareByScheduledAt);
  const prescriptions = [...data.prescriptions].sort(compareByStartDate);
  const residents = [...data.residents].sort(compareByAdmissionDate);
  const statusCounts = countByStatus(administrations);
  const pendingAdministrations = statusCounts.PENDING ?? 0;
  const administeredAdministrations = statusCounts.ADMINISTERED ?? 0;
  const totalAdministrations = administrations.length;
  const lateAdministrations = administrations.filter((administration) =>
    isLateAdministration(administration, currentTime),
  ).length;
  const incidentAdministrations =
    (statusCounts.REFUSED ?? 0) + (statusCounts.MISSED ?? 0);
  const endingSoonPrescriptions = prescriptions.filter((prescription) =>
    isEndingSoon(prescription, currentTime),
  );
  const completionRate =
    totalAdministrations === 0
      ? 0
      : Math.round((administeredAdministrations / totalAdministrations) * 100);
  const filteredAdministrations = administrations.filter((administration) =>
    matchesSearch(
      [
        administration.resident?.fullName,
        getMedicationName(administration.medication),
        administration.prescription?.frequency,
      ],
      normalizedSearch,
    ),
  );
  const filteredPrescriptions = prescriptions.filter((prescription) =>
    matchesSearch(
      [
        prescription.resident?.fullName,
        getMedicationName(prescription.medication),
        prescription.frequency,
      ],
      normalizedSearch,
    ),
  );
  const filteredResidents = residents.filter((resident) =>
    matchesSearch([resident.fullName, resident.bloodType], normalizedSearch),
  );
  const alerts = buildAlerts({
    lateAdministrations,
    incidentAdministrations,
    endingSoonPrescriptions,
  });

  return {
    alerts,
    completionRate,
    endingSoonPrescriptions,
    filteredAdministrations,
    filteredPrescriptions,
    filteredResidents,
    lateAdministrations,
    pendingAdministrations,
    recentResidents: residents.slice(0, 5),
    statusCounts,
    totalAdministrations,
  };
}

function buildAlerts({
  lateAdministrations,
  incidentAdministrations,
  endingSoonPrescriptions,
}) {
  const alerts = [];

  if (lateAdministrations > 0) {
    alerts.push({
      id: "late-administrations",
      label: "Administrações atrasadas",
      value: lateAdministrations,
      detail: "exigem conferência da equipe",
      tone: "danger",
    });
  }

  if (incidentAdministrations > 0) {
    alerts.push({
      id: "incident-administrations",
      label: "Recusas ou perdas",
      value: incidentAdministrations,
      detail: "registradas na agenda de hoje",
      tone: "warning",
    });
  }

  if (endingSoonPrescriptions.length > 0) {
    alerts.push({
      id: "ending-prescriptions",
      label: "Prescrições encerrando",
      value: endingSoonPrescriptions.length,
      detail: "nos próximos 7 dias",
      tone: "info",
    });
  }

  return alerts;
}

function countByStatus(administrations) {
  return administrations.reduce((accumulator, administration) => {
    const status = administration.status ?? "PENDING";
    accumulator[status] = (accumulator[status] ?? 0) + 1;
    return accumulator;
  }, {});
}

function matchesSearch(values, normalizedSearch) {
  if (!normalizedSearch) {
    return true;
  }

  return values.some((value) => normalizeText(value).includes(normalizedSearch));
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isLateAdministration(administration, currentTime) {
  const scheduledAt = toDate(administration.scheduledAt);

  return (
    administration.status === "PENDING" &&
    scheduledAt &&
    currentTime > 0 &&
    scheduledAt.getTime() < currentTime
  );
}

function isEndingSoon(prescription, currentTime) {
  const endDate = toDate(prescription.endDate);

  if (!endDate || currentTime <= 0) {
    return false;
  }

  const now = new Date(currentTime);
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(now.getDate() + 7);

  return endDate >= now && endDate <= sevenDaysFromNow;
}

function compareByScheduledAt(first, second) {
  return compareDates(first.scheduledAt, second.scheduledAt, "asc");
}

function compareByStartDate(first, second) {
  return compareDates(first.startDate, second.startDate, "desc");
}

function compareByAdmissionDate(first, second) {
  return compareDates(first.admissionDate, second.admissionDate, "desc");
}

function compareDates(firstDate, secondDate, direction = "asc") {
  const firstTime = toDate(firstDate)?.getTime() ?? 0;
  const secondTime = toDate(secondDate)?.getTime() ?? 0;

  return direction === "asc" ? firstTime - secondTime : secondTime - firstTime;
}

function getMedicationName(medication) {
  if (!medication) {
    return "Medicamento";
  }

  return medication.brandName
    ? `${medication.genericName} (${medication.brandName})`
    : medication.genericName;
}

function getDosage(administration) {
  const dosage = administration.prescription?.dosage;
  const abbreviation = administration.measurementUnit?.abbreviation;

  return [dosage, abbreviation].filter(Boolean).join(" ") || "Dose registrada";
}

function toDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTime(date) {
  if (!date) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDate(date) {
  if (!date) {
    return "Hoje";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date);
}

function formatShortDate(value) {
  const date = toDate(value);

  if (!date) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatDateRange(startDate, endDate) {
  const formattedStart = formatShortDate(startDate);

  if (!endDate) {
    return `Desde ${formattedStart}`;
  }

  return `${formattedStart} - ${formatShortDate(endDate)}`;
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
