import { useEffect, useMemo, useState } from "react";
import { listUsers } from "@/features/auth/api/userService";
import { formatCpf, formatPhone } from "@/shared/utils/documentFormatter";
import { formatShortDate } from "@/shared/utils/dateFormatter";
import { getRequestErrorMessage } from "@/shared/utils/formErrors";
import { getInitials } from "@/shared/utils/nameFormatter";
import { matchesSearch } from "@/shared/utils/search";
import { normalizeText } from "@/shared/utils/textFormatter";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingRows } from "@/shared/ui/LoadingRows";
import { MetricCard } from "@/shared/ui/MetricCard";
import { PanelHeader } from "@/shared/ui/PanelHeader";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import "./TeamView.css";

const roleLabels = {
  admin: "Administrador",
  caregiver: "Cuidador",
};

const roleFilters = [
  { id: "all", label: "Todos" },
  { id: "admin", label: "Administradores" },
  { id: "caregiver", label: "Cuidadores" },
  { id: "inactive", label: "Inativos" },
];

export function TeamView({ searchTerm }) {
  const [users, setUsers] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loadStatus, setLoadStatus] = useState({
    error: "",
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      setLoadStatus({ error: "", isLoading: true });

      try {
        const nextUsers = await listUsers();

        if (isMounted) {
          setUsers(nextUsers);
          setLoadStatus({ error: "", isLoading: false });
        }
      } catch (error) {
        if (isMounted) {
          setLoadStatus({
            error: getRequestErrorMessage(
              error,
              "Não foi possível carregar a equipe.",
            ),
            isLoading: false,
          });
        }
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedUsers = useMemo(
    () =>
      [...users].sort((firstUser, secondUser) =>
        (firstUser.fullName ?? "").localeCompare(
          secondUser.fullName ?? "",
          "pt-BR",
        ),
      ),
    [users],
  );
  const stats = useMemo(() => buildTeamStats(sortedUsers), [sortedUsers]);
  const visibleUsers = useMemo(
    () =>
      filterUsers(sortedUsers, {
        filterId: activeFilter,
        searchTerm,
      }),
    [activeFilter, searchTerm, sortedUsers],
  );
  const activeFilterLabel =
    roleFilters.find((filter) => filter.id === activeFilter)?.label ?? "Todos";
  const filterCounts = {
    admin: stats.admins,
    all: stats.total,
    caregiver: stats.caregivers,
    inactive: stats.inactive,
  };

  return (
    <>
      <section className="dashboard-hero team-hero">
        <div className="dashboard-hero-copy">
          <span className="overline">Equipe</span>
          <h2>Usuários da instituição</h2>
          <p>
            Consulte os usuários vinculados à empresa autenticada, seus perfis
            de acesso e status operacional.
          </p>
        </div>

        <div className="dashboard-hero-status" aria-label="Resumo da equipe">
          <span className="dashboard-company-status is-active">Admin</span>
          <strong>{stats.active} ativos</strong>
          <span>{stats.admins} administradores</span>
        </div>
      </section>

      <section className="dashboard-overview-grid" aria-label="Resumo de usuários">
        <MetricCard
          detail={`${visibleUsers.length} visíveis na busca`}
          label="Usuários"
          loading={loadStatus.isLoading}
          value={stats.total}
        />
        <MetricCard
          detail="com acesso administrativo"
          label="Administradores"
          loading={loadStatus.isLoading}
          value={stats.admins}
        />
        <MetricCard
          detail="perfil de cuidador"
          label="Cuidadores"
          loading={loadStatus.isLoading}
          value={stats.caregivers}
        />
        <MetricCard
          detail={stats.inactive > 0 ? "revisar permissões" : "sem bloqueios"}
          label="Inativos"
          loading={loadStatus.isLoading}
          tone={stats.inactive > 0 ? "danger" : "success"}
          value={stats.inactive}
        />
      </section>

      <section className="dashboard-panel team-panel">
        <div className="dashboard-toolbar team-toolbar">
          <div className="dashboard-filter-group" aria-label="Filtros da equipe">
            {roleFilters.map((filter) => (
              <button
                aria-pressed={activeFilter === filter.id}
                className={`dashboard-filter-button team-filter-button${
                  activeFilter === filter.id ? " is-active" : ""
                }`}
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
              >
                <span>{filter.label}</span>
                <small>{filterCounts[filter.id] ?? 0}</small>
              </button>
            ))}
          </div>
        </div>

        <PanelHeader
          action={`${visibleUsers.length} em ${activeFilterLabel}`}
          overline="Lista"
          title="Equipe cadastrada"
        />

        {loadStatus.error ? (
          <div className="dashboard-form-alert dashboard-form-alert-danger" role="status">
            {loadStatus.error}
          </div>
        ) : null}

        {loadStatus.isLoading ? (
          <LoadingRows />
        ) : visibleUsers.length > 0 ? (
          <TeamDirectory users={visibleUsers} />
        ) : (
          <EmptyState title="Nenhum usuário encontrado para o filtro atual." />
        )}
      </section>
    </>
  );
}

function TeamDirectory({ users }) {
  return (
    <div
      aria-label="Lista de usuários"
      className={`team-directory${users.length > 8 ? " is-scrollable" : ""}`}
      tabIndex={users.length > 8 ? 0 : undefined}
    >
      <div className="team-directory-header" aria-hidden="true">
        <span>Usuário</span>
        <span>Contato</span>
        <span>Documento</span>
        <span>Perfil</span>
        <span>Status</span>
        <span>Cadastro</span>
      </div>

      {users.map((user) => (
        <TeamRow key={user.id} user={user} />
      ))}
    </div>
  );
}

function TeamRow({ user }) {
  const displayName = user.fullName || user.email || "Usuário";
  const roleLabel = roleLabels[user.role] ?? "Perfil não informado";
  const isActive = user.isActive !== false;

  return (
    <article className="team-row">
      <div className="team-user-cell">
        <span className="team-avatar">{getInitials(displayName)}</span>
        <div>
          <strong>{displayName}</strong>
          <span>{user.email || "E-mail não informado"}</span>
        </div>
      </div>

      <span>{user.phone ? formatPhone(user.phone) : "Telefone não informado"}</span>
      <span>{user.cpf ? formatCpf(user.cpf) : "CPF não informado"}</span>
      <StatusBadge tone={user.role === "admin" ? "pending" : "muted"}>
        {roleLabel}
      </StatusBadge>
      <StatusBadge tone={isActive ? "success" : "danger"}>
        {isActive ? "Ativo" : "Inativo"}
      </StatusBadge>
      <time dateTime={user.createdAt}>{formatShortDate(user.createdAt)}</time>
    </article>
  );
}

function buildTeamStats(users) {
  return users.reduce(
    (acc, user) => {
      acc.total += 1;

      if (user.isActive === false) {
        acc.inactive += 1;
      } else {
        acc.active += 1;
      }

      if (user.role === "admin") {
        acc.admins += 1;
      }

      if (user.role === "caregiver") {
        acc.caregivers += 1;
      }

      return acc;
    },
    {
      active: 0,
      admins: 0,
      caregivers: 0,
      inactive: 0,
      total: 0,
    },
  );
}

function filterUsers(users, { filterId, searchTerm }) {
  const query = normalizeText(searchTerm);

  return users.filter((user) => {
    if (filterId === "inactive" && user.isActive !== false) {
      return false;
    }

    if (filterId !== "all" && filterId !== "inactive" && user.role !== filterId) {
      return false;
    }

    if (!query) {
      return true;
    }

    return matchesSearch(
      [
        user.fullName,
        user.email,
        user.phone,
        user.cpf,
        roleLabels[user.role],
        user.isActive === false ? "inativo" : "ativo",
      ],
      query,
    );
  });
}
