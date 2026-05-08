import { Link } from "react-router-dom";
import FormSection from "../../components/forms/FormSection";
import InputField from "../../components/ui/InputField";
import {
  companyRegisterFormAction,
  companyRegisterHero,
  companyRegisterNavActions,
  companyRegisterPanel,
  companyRegisterSections,
} from "../../data/companyRegister";
import { useCompanyRegisterForm } from "../../hooks/useCompanyRegisterForm";
import "./CompanyRegisterPage.css";

function CompanyRegisterPage() {
  const {
    fieldErrors,
    form,
    globalError,
    handleChange,
    handleSubmit,
    isSubmitting,
  } = useCompanyRegisterForm();

  return (
    <>
      <nav className="nav register-nav" aria-label="Navegação principal">
        <Link className="nav-logo" to="/" aria-label="ZeloTech">
          Zelo<span>Tech</span>
        </Link>
        <div className="nav-ctas">
          {companyRegisterNavActions.map((action) => (
            <Link
              className={action.className}
              key={action.href}
              to={action.href}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="company-register-page">
        <section className="register-hero">
          <div className="register-hero-copy">
            <span className="overline">{companyRegisterHero.eyebrow}</span>
            <h1 className="register-title">{companyRegisterHero.title}</h1>
            <p className="register-subtitle">
              {companyRegisterHero.subtitle}
            </p>
          </div>
          <aside
            className="register-panel"
            aria-label={companyRegisterPanel.ariaLabel}
          >
            <div className="register-panel-title">
              {companyRegisterPanel.title}
            </div>
            <ul className="register-panel-list">
              {companyRegisterPanel.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </section>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          {globalError ? (
            <div className="form-alert" role="alert">
              {globalError}
            </div>
          ) : null}

          {companyRegisterSections.map((section) => (
            <FormSection
              description={section.description}
              eyebrow={section.eyebrow}
              key={section.eyebrow}
              title={section.title}
            >
              {section.fields.map((field) => (
                <InputField
                  {...field}
                  error={fieldErrors[field.name]}
                  key={field.name}
                  onChange={handleChange}
                  value={form[field.name]}
                />
              ))}
            </FormSection>
          ))}

          <div className="form-actions">
            <p className="form-legal">{companyRegisterFormAction.legalText}</p>
            <button
              className="btn btn-navy btn-lg register-submit"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting
                ? companyRegisterFormAction.submittingLabel
                : companyRegisterFormAction.submitLabel}
              <span className="arrow">›</span>
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

export default CompanyRegisterPage;
