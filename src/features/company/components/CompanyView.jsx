import { companyDetailItems, companyProfileFields } from "@/features/company/data/companyProfile";
import { useCompanyProfileForm } from "@/features/company/hooks/useCompanyProfileForm";
import { formatCnpj, formatPhone } from "@/shared/utils/documentFormatter";
import { formatDateTime } from "@/shared/utils/dateFormatter";
import { EmptyState } from "@/shared/ui/EmptyState";
import { FieldError } from "@/shared/ui/FieldError";
import { LoadingRows } from "@/shared/ui/LoadingRows";
import { PanelHeader } from "@/shared/ui/PanelHeader";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import "./CompanyView.css";

export function CompanyView({ initialCompany, onCompanyUpdated }) {
  const {
    company,
    feedback,
    fieldErrors,
    form,
    globalError,
    handleChange,
    handleReset,
    handleSubmit,
    hasChanges,
    isLoading,
    isSubmitting,
  } = useCompanyProfileForm({ initialCompany, onCompanyUpdated });

  const companyName =
    company?.tradeName || company?.legalName || "Empresa ZeloTech";
  const statusLabel = company?.isActive === false ? "Inativa" : "Ativa";
  const statusTone = company?.isActive === false ? "danger" : "success";
  const formAction = hasChanges ? "Alterações pendentes" : "Atualizado";

  return (
    <section className="company-view" aria-label="Empresa">
      <div className="dashboard-hero company-profile-hero">
        <div className="dashboard-hero-copy">
          <span className="overline">Empresa</span>
          <h2>{companyName}</h2>
          <p>{company?.legalName || "Dados institucionais da operação."}</p>
        </div>

        <div className="company-profile-status">
          <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
          <div>
            <span>Última atualização</span>
            <strong>{formatDateTime(company?.updatedAt, "Sem atualização")}</strong>
          </div>
        </div>
      </div>

      <div className="company-layout">
        <section className="dashboard-panel company-form-panel">
          <PanelHeader
            action={isLoading ? "Carregando" : formAction}
            overline="Cadastro"
            title="Dados da empresa"
          />

          {isLoading ? (
            <LoadingRows />
          ) : company ? (
            <CompanyForm
              feedback={feedback}
              fieldErrors={fieldErrors}
              form={form}
              globalError={globalError}
              hasChanges={hasChanges}
              isSubmitting={isSubmitting}
              onChange={handleChange}
              onReset={handleReset}
              onSubmit={handleSubmit}
            />
          ) : (
            <EmptyState title="Não foi possível exibir os dados da empresa." />
          )}
        </section>

        <aside className="dashboard-panel company-detail-panel">
          <PanelHeader
            action={company ? statusLabel : undefined}
            overline="Resumo"
            title="Identificação"
          />

          {isLoading ? (
            <LoadingRows compact />
          ) : company ? (
            <CompanyDetails company={company} />
          ) : (
            <EmptyState title="Empresa não encontrada." />
          )}
        </aside>
      </div>
    </section>
  );
}

function CompanyForm({
  feedback,
  fieldErrors,
  form,
  globalError,
  hasChanges,
  isSubmitting,
  onChange,
  onReset,
  onSubmit,
}) {
  return (
    <form className="dashboard-form company-form" noValidate onSubmit={onSubmit}>
      {globalError ? (
        <div
          className="dashboard-form-alert dashboard-form-alert-danger"
          role="status"
        >
          {globalError}
        </div>
      ) : null}

      {feedback ? (
        <div
          className="dashboard-form-alert dashboard-form-alert-success"
          role="status"
        >
          {feedback}
        </div>
      ) : null}

      <div className="dashboard-form-grid company-form-grid">
        {companyProfileFields.map((field) => (
          <label
            className={`dashboard-field${
              fieldErrors[field.name] ? " has-error" : ""
            }`}
            key={field.name}
          >
            <span>{field.label}</span>
            <input
              aria-invalid={Boolean(fieldErrors[field.name])}
              autoComplete={field.autoComplete}
              id={field.id}
              inputMode={field.inputMode}
              maxLength={field.maxLength}
              name={field.name}
              placeholder={field.placeholder}
              type={field.type ?? "text"}
              value={form[field.name]}
              onChange={onChange}
            />
            <FieldError message={fieldErrors[field.name]} />
          </label>
        ))}
      </div>

      <div className="dashboard-form-actions">
        <button
          className="dashboard-button dashboard-button-muted"
          disabled={!hasChanges || isSubmitting}
          type="button"
          onClick={onReset}
        >
          Desfazer
        </button>
        <button
          className="dashboard-button dashboard-button-primary"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}

function CompanyDetails({ company }) {
  return (
    <div className="company-detail-content">
      <div className="dashboard-detail-grid company-detail-grid">
        {companyDetailItems.map((item) => (
          <div className="dashboard-detail-item" key={item.key}>
            <span>{item.label}</span>
            <strong>{getCompanyDetailValue(company, item.key)}</strong>
          </div>
        ))}
      </div>

      <div className="company-meta-list">
        <CompanyMetaItem
          label="Criada em"
          value={formatDateTime(company.createdAt, "Sem data")}
        />
        <CompanyMetaItem
          label="Atualizada em"
          value={formatDateTime(company.updatedAt, "Sem data")}
        />
      </div>
    </div>
  );
}

function CompanyMetaItem({ label, value }) {
  return (
    <div className="company-meta-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getCompanyDetailValue(company, key) {
  if (key === "taxId") {
    return company.taxId ? formatCnpj(company.taxId) : "Não informado";
  }

  if (key === "phone") {
    return company.phone ? formatPhone(company.phone) : "Não informado";
  }

  return company[key] || "Não informado";
}
