function BenefitCard({ benefit, index }) {
  return (
    <article className={`benefit-card ${benefit.theme}-accent`}>
      <div className={`benefit-icon benefit-icon-${benefit.theme}`}>
        {benefit.icon}
      </div>
      <div className="benefit-num">{String(index + 1).padStart(2, "0")}</div>
      <h3 className="benefit-title">{benefit.title}</h3>
      <p className="benefit-desc">{benefit.description}</p>
    </article>
  );
}

function Benefits({ benefits }) {
  return (
    <section id="beneficios" className="benefits section-pad">
      <div className="container">
        <div className="section-header centered benefits-header">
          <span className="overline">Benefícios</span>
          <h2 className="section-h">Cuidado na palma da mão</h2>
          <p className="section-sub">
            Tecnologia desenvolvida especificamente para o cuidado de idosos —
            funcional para instituições e acessível para famílias.
          </p>
        </div>
        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <BenefitCard benefit={benefit} index={index} key={benefit.title} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Benefits;
