import { useEffect, useMemo, useState } from "react";
import { listCompanyFamilyAccesses } from "@/features/family-access/api/familyAccessService";
import { formatShortDateTime } from "@/shared/utils/dateFormatter";
import { formatPhone } from "@/shared/utils/documentFormatter";
import { getRequestErrorMessage } from "@/shared/utils/formErrors";
import { getInitials } from "@/shared/utils/nameFormatter";
import { matchesSearch } from "@/shared/utils/search";
import { normalizeText } from "@/shared/utils/textFormatter";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingRows } from "@/shared/ui/LoadingRows";
import { MetricCard } from "@/shared/ui/MetricCard";
import { PanelHeader } from "@/shared/ui/PanelHeader";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import "./FamilyAccessView.css";

const accessFilters = [
  { id: "all", label: "Todos" },
  { id: "active", label: "Ativos" },
  { id: "inactive", label: "Inativos" },
];

export function FamilyAccessView({ isAdmin, searchTerm }) {
  const [accesses, setAccesses] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loadStatus, setLoadStatus] = useState({
    error: "",
    isLoading: Boolean(isAdmin),
  });

  useEffect(() => {
    if (!isAdmin) {
      setAccesses([]);
      setLoadStatus({
        error: "Apenas administradores podem visualizar vínculos de familiares.",
        isLoading: false,
      });
      return undefined;
    }

    let isMounted = true;

    async function loadFamilyAccesses() {
      setLoadStatus({ error: "", isLoading: true });

      try {
        const nextAccesses = await listCompanyFamilyAccesses();

        if (isMounted) {
          setAccesses(nextAccesses);
          setLoadStatus({ error: "", isLoading: false });
        }
      } catch (error) {
        if (isMounted) {
          setLoadStatus({
            error: getRequestErrorMessage(
              error,
              "Não foi possível carregar os familiares vinculados.",
            ),
            isLoading: false,
          });
        }
      }
    }

    loadFamilyAccesses();

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  const sortedAccesses = useMemo(
    () =>
      [...accesses].sort((firstAccess, secondAccess) => {
        return (
          getTimestamp(secondAccess.createdAt) - getTimestamp(firstAccess.createdAt)
        );
      }),
    [accesses],
  );
  const stats = useMemo(() => buildFamilyAccessStats(sortedAccesses), [sortedAccesses]);
  const visibleAccesses = useMemo(
    () =>
      filterFamilyAccesses(sortedAccesses, {
        filterId: activeFilter,
        searchTerm,
      }),
    [activeFilter, searchTerm, sortedAccesses],
  );
  const activeFilterLabel =
    accessFilters.find((filter) => filter.id === activeFilter)?.label ?? "Todos";
  const filterCounts = {
    active: stats.active,
    all: stats.total,
    inactive: stats.inactive,
  };

  return (
    <>
      <section className="dashboard-hero family-access-hero">
        <div className="dashboard-hero-copy">
          <span className="overline">Família / Acessos</span>
          <h2>Familiares dos residentes</h2>
          <p>
            Consulte os familiares vinculados aos residentes da empresa, com
            relacionamento, contato e status do vínculo.
          </p>
        </div>

        <div className="dashboard-hero-status" aria-label="Resumo dos vínculos">
          <span className="dashboard-company-status is-active">Admin</span>
          <strong>{stats.active} vínculos ativos</strong>
          <span>{stats.residents} residentes com familiar</span>
        </div>
      </section>

      <section className="dashboard-overview-grid" aria-label="Resumo de familiares">
        <MetricCard
          detail={`${visibleAccesses.length} visíveis na busca`}
          label="Vínculos"
          loading={loadStatus.isLoading}
          value={stats.total}
        />
        <MetricCard
          detail="familiares cadastrados"
          label="Familiares"
          loading={loadStatus.isLoading}
          value={stats.familyMembers}
        />
        <MetricCard
          detail="residentes com vínculo"
          label="Residentes"
          loading={loadStatus.isLoading}
          value={stats.residents}
        />
        <MetricCard
          detail={stats.inactive > 0 ? "revisar acessos" : "sem bloqueios"}
          label="Inativos"
          loading={loadStatus.isLoading}
          tone={stats.inactive > 0 ? "danger" : "success"}
          value={stats.inactive}
        />
      </section>

      <section className="dashboard-panel family-access-panel">
        <div className="dashboard-toolbar family-access-toolbar">
          <div
            aria-label="Filtros de vínculos familiares"
            className="dashboard-filter-group"
          >
            {accessFilters.map((filter) => (
              <button
                aria-pressed={activeFilter === filter.id}
                className={`dashboard-filter-button family-access-filter-button${
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
          action={`${visibleAccesses.length} em ${activeFilterLabel}`}
          overline="Lista"
          title="Familiares vinculados"
        />

        {loadStatus.error ? (
          <div className="dashboard-form-alert dashboard-form-alert-danger" role="status">
            {loadStatus.error}
          </div>
        ) : null}

        {loadStatus.isLoading ? (
          <LoadingRows />
        ) : visibleAccesses.length > 0 ? (
          <FamilyAccessDirectory accesses={visibleAccesses} />
        ) : (
          <EmptyState title="Nenhum vínculo familiar encontrado para o filtro atual." />
        )}
      </section>
    </>
  );
}

function FamilyAccessDirectory({ accesses }) {
  return (
    <div
      aria-label="Lista de familiares vinculados"
      className={`family-access-directory${
        accesses.length > 8 ? " is-scrollable" : ""
      }`}
      tabIndex={accesses.length > 8 ? 0 : undefined}
    >
      <div className="family-access-directory-header" aria-hidden="true">
        <span>Familiar</span>
        <span>Residente</span>
        <span>Contato</span>
        <span>Relação</span>
        <span>Status</span>
        <span>Vinculado em</span>
      </div>

      {accesses.map((access, index) => (
        <FamilyAccessRow access={access} key={getAccessKey(access, index)} />
      ))}
    </div>
  );
}

function FamilyAccessRow({ access }) {
  const familyMember = access.familyMember ?? {};
  const resident = access.resident ?? {};
  const familyName = familyMember.fullName || familyMember.email || "Familiar";
  const residentName = resident.fullName || "Residente não informado";
  const isActive = access.isActive !== false;

  return (
    <article className="family-access-row">
      <div className="family-access-person-cell">
        <span className="family-access-avatar" aria-hidden="true">
          {getInitials(familyName)}
        </span>
        <div>
          <strong>{familyName}</strong>
          <span>{familyMember.email || "E-mail não informado"}</span>
        </div>
      </div>

      <div className="family-access-resident-cell">
        <strong>{residentName}</strong>
        <span>{formatResidentStatus(resident.status)}</span>
      </div>

      <span data-label="Contato">{getFamilyMemberPhoneLabel(familyMember.phone)}</span>
      <span data-label="Relação">{formatRelationship(access.relationship)}</span>
      <span className="family-access-status-cell" data-label="Status">
        <StatusBadge tone={isActive ? "success" : "danger"}>
          {isActive ? "Ativo" : "Inativo"}
        </StatusBadge>
      </span>
      <time data-label="Vinculado em" dateTime={access.createdAt}>
        {formatShortDateTime(access.createdAt, "Sem data")}
      </time>
    </article>
  );
}

function buildFamilyAccessStats(accesses) {
  const stats = accesses.reduce(
    (acc, access) => {
      acc.total += 1;

      if (access.isActive === false) {
        acc.inactive += 1;
      } else {
        acc.active += 1;
      }

      const familyMemberKey =
        access.familyMember?.id ||
        access.familyMember?.email ||
        access.familyMember?.fullName;
      const residentKey = access.resident?.id || access.resident?.fullName;

      if (familyMemberKey) {
        acc.familyMemberIds.add(familyMemberKey);
      }

      if (residentKey) {
        acc.residentIds.add(residentKey);
      }

      return acc;
    },
    {
      active: 0,
      familyMemberIds: new Set(),
      inactive: 0,
      residentIds: new Set(),
      total: 0,
    },
  );

  return {
    active: stats.active,
    familyMembers: stats.familyMemberIds.size,
    inactive: stats.inactive,
    residents: stats.residentIds.size,
    total: stats.total,
  };
}

function filterFamilyAccesses(accesses, { filterId, searchTerm }) {
  const query = normalizeText(searchTerm);

  return accesses.filter((access) => {
    if (filterId === "active" && access.isActive === false) {
      return false;
    }

    if (filterId === "inactive" && access.isActive !== false) {
      return false;
    }

    if (!query) {
      return true;
    }

    return matchesSearch(
      [
        access.resident?.fullName,
        formatResidentStatus(access.resident?.status),
        access.familyMember?.fullName,
        access.familyMember?.email,
        access.familyMember?.phone,
        formatPhone(access.familyMember?.phone ?? ""),
        formatRelationship(access.relationship),
        access.isActive === false ? "inativo" : "ativo",
      ],
      query,
    );
  });
}

function formatRelationship(value) {
  if (!value) {
    return "Não informado";
  }

  return String(value).replace(/^./, (letter) => letter.toUpperCase());
}

function formatResidentStatus(value) {
  const normalizedStatus = normalizeText(value);

  if (normalizedStatus === "active" || normalizedStatus === "ativo") {
    return "Residente ativo";
  }

  if (normalizedStatus === "inactive" || normalizedStatus === "inativo") {
    return "Residente inativo";
  }

  return "Status não informado";
}

function getTimestamp(value) {
  const timestamp = new Date(value ?? 0).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getAccessKey(access, index) {
  return (
    access.id ||
    [
      access.familyMember?.id,
      access.familyMember?.email,
      access.resident?.id,
      access.relationship,
      access.createdAt,
    ]
      .filter(Boolean)
      .join("-") ||
    `family-access-${index}`
  );
}

function getFamilyMemberPhoneLabel(phone) {
  return phone ? formatPhone(phone) : "Telefone não informado";
}
