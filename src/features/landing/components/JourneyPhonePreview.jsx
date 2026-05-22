import {
  careDashboardPreview,
  familyAppPreview,
  residentProfilePreview,
} from "@/features/landing/data/landing";

function LinkedResidentsPhoneScreen() {
  return (
    <div className="phone-screen phone-linked-screen">
      <div className="phone-family-hero">
        <div className="phone-brand-row">
          <div className="phone-brand-mark">♥</div>
          <div className="phone-brand-name">
            Zelo<span>Tech</span>
          </div>
        </div>
        <div className="phone-greeting">
          <span>Boa tarde,</span>
          <strong>{familyAppPreview.greetingName}</strong>
        </div>
        <div className="phone-linked-summary">
          <div className="phone-summary-icon">♥</div>
          <div>
            <strong>{familyAppPreview.summary.title}</strong>
            <span>{familyAppPreview.summary.subtitle}</span>
          </div>
          <b>›</b>
        </div>
      </div>

      <div className="phone-residents-section">
        <div className="phone-residents-header">
          <strong>Meus residentes</strong>
          <span>+ Vincular</span>
        </div>
        <div className="phone-residents-list">
          {familyAppPreview.residents.map((resident) => (
            <div className="phone-resident-card" key={resident.name}>
              <div className="phone-resident-info">
                <strong>{resident.name}</strong>
                <span>
                  <b>{resident.kinship}</b>
                  {resident.age} · {resident.bloodType}
                </span>
              </div>
              <em>{resident.status}</em>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResidentProfilePhoneScreen() {
  return (
    <div className="phone-screen phone-profile-screen">
      <div className="phone-profile-hero">
        <div className="phone-profile-back">‹ Voltar</div>
        <div className="phone-profile-main">
          <div className="phone-profile-avatar">
            {residentProfilePreview.initials}
          </div>
          <div>
            <strong>{residentProfilePreview.name}</strong>
            <div className="phone-profile-badges">
              <span>{residentProfilePreview.relationship}</span>
              <em>{residentProfilePreview.status}</em>
            </div>
          </div>
        </div>
      </div>

      <div className="phone-profile-body">
        <div className="phone-profile-stats">
          {residentProfilePreview.stats.map((stat) => (
            <div key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.helper}</small>
            </div>
          ))}
        </div>

        <div className="phone-profile-panel">
          <h4>Condições de saúde</h4>
          <div className="phone-condition-list">
            {residentProfilePreview.conditions.map((condition) => (
              <div className="phone-condition-item" key={condition.name}>
                <div>
                  <strong>{condition.name}</strong>
                  <em>{condition.tag}</em>
                </div>
                <span>{condition.note}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="phone-profile-panel phone-med-panel">
          <h4>Medicamentos ativos</h4>
          <div className="phone-med-list">
            {residentProfilePreview.medications.map((medication) => (
              <span key={medication}>{medication}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CareDashboardPhoneScreen() {
  return (
    <div className="phone-screen">
      <div className="phone-header">{careDashboardPreview.title}</div>
      {careDashboardPreview.metrics.map((metric) => (
        <div className="phone-card" key={metric.label}>
          <div className="phone-card-label">{metric.label}</div>
          <div className="phone-card-val">{metric.value}</div>
          <div className="phone-bar">
            <div className={`phone-bar-fill ${metric.fillClassName}`} />
          </div>
          <div className="phone-pill">{metric.status}</div>
        </div>
      ))}
      <div className="phone-card">
        <div className="phone-card-label">
          {careDashboardPreview.medication.label}
        </div>
        <div className="phone-card-val phone-confirmed">
          {careDashboardPreview.medication.value}
        </div>
      </div>
    </div>
  );
}

function getCaption(activeStep) {
  if (activeStep === 2) {
    return "App familiar com residentes vinculados";
  }

  if (activeStep === 3) {
    return "Detalhe do residente com saúde e medicamentos";
  }

  return "App disponível para iOS e Android";
}

function JourneyPhonePreview({ activeStep }) {
  return (
    <div className="how-visual">
      <div className="how-visual-inner">
        <div
          className={`how-phone-mock phone-swap ${activeStep === 2 ? "phone-mock-linked" : ""} ${activeStep === 3 ? "phone-mock-profile" : ""}`}
          key={`journey-phone-${activeStep}`}
        >
          {activeStep === 2 ? (
            <LinkedResidentsPhoneScreen />
          ) : activeStep === 3 ? (
            <ResidentProfilePhoneScreen />
          ) : (
            <CareDashboardPhoneScreen />
          )}
        </div>
        <div
          className="app-caption app-caption-swap"
          key={`journey-caption-${activeStep}`}
        >
          {getCaption(activeStep)}
        </div>
        <div className="store-buttons">
          <div className="store-button">▶ App Store</div>
          <div className="store-button">▶ Google Play</div>
        </div>
      </div>
      <div className="blob blob-teal" />
      <div className="blob blob-navy" />
    </div>
  );
}

export default JourneyPhonePreview;
