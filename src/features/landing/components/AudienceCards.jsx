import { FAMILY_APP_URL } from "@/shared/constants/externalLinks";

function AudienceCard({ audience }) {
  const isInstitution = audience.type === "institution";
  const tone = isInstitution ? "light" : "dark";
  const href = isInstitution ? "/cadastro-instituicao" : FAMILY_APP_URL;

  return (
    <article className={`for-who-card ${audience.type}`}>
      <div>
        <div className={`fw-tag ${isInstitution ? "inst" : "fam"}`}>
          {audience.tag}
        </div>
        <h3 className={`fw-h ${tone}`}>{audience.title}</h3>
        <p className={`fw-p ${tone}`}>{audience.description}</p>
        <ul className={`fw-features ${tone}`}>
          {audience.features.map((feature) => (
            <li key={feature}>
              <span className={`fw-check ${tone}`}>✓</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <a
        href={href}
        className={`btn ${isInstitution ? "btn-ghost-white" : "btn-teal"} btn-lg fit-button`}
      >
        {audience.button} <span className="arrow">›</span>
      </a>
    </article>
  );
}

function AudienceCards({ audiences }) {
  return (
    <section id="para-quem" className="section-pad">
      <div className="container">
        <span className="overline">Para quem é</span>
        <h2 className="section-h audience-title">
          Dois perfis, um só <span className="accent">cuidado</span>
        </h2>
        <div className="for-who-grid">
          {audiences.map((audience) => (
            <AudienceCard audience={audience} key={audience.type} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default AudienceCards;
