function FormSection({ children, description, eyebrow, title }) {
  return (
    <section className="form-section" aria-labelledby={`${eyebrow}-title`}>
      <div className="form-section-heading">
        <span className="form-section-eyebrow">{eyebrow}</span>
        <h2 id={`${eyebrow}-title`} className="form-section-title">
          {title}
        </h2>
        {description ? (
          <p className="form-section-description">{description}</p>
        ) : null}
      </div>
      <div className="form-grid">{children}</div>
    </section>
  );
}

export default FormSection;
