import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AudienceCards from "@/features/landing/components/AudienceCards";
import Benefits from "@/features/landing/components/Benefits";
import Faq from "@/features/landing/components/Faq";
import {
  audiences,
  benefits,
  faqItems,
  footerColumns,
  howSteps,
  navLinks,
  numbers,
  partners,
} from "../../data/landing";
import useActiveSection from "@/features/landing/hooks/useActiveSection";
import { CAREGIVER_FEATURE_PENDING_MESSAGE } from "@/features/auth/constants/accessMessages";
import {
  hasAdminSession,
  hasCaregiverSession,
} from "@/features/auth/utils/session";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();
  const activeSection = useActiveSection(navLinks);
  const [activeStep, setActiveStep] = useState(0);

  function handleLoginClick(event) {
    event.preventDefault();

    if (hasAdminSession()) {
      navigate("/dashboard");
      return;
    }

    if (hasCaregiverSession()) {
      window.alert(CAREGIVER_FEATURE_PENDING_MESSAGE);
      return;
    }

    navigate("/login");
  }

  return (
    <>
      <nav className="nav" aria-label="Navegação principal">
        <a className="nav-logo" href="#top" aria-label="ZeloTech">
          Zelo<span>Tech</span>
        </a>
        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                className={
                  activeSection === link.href.slice(1) ? "active" : undefined
                }
                href={link.href}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav-ctas">
          <Link
            to="/login"
            className="btn btn-outline-navy btn-sm"
            onClick={handleLoginClick}
          >
            Fazer login
          </Link>
          <Link to="/cadastro-instituicao" className="btn btn-navy btn-sm">
            Cadastrar grátis <span className="arrow">›</span>
          </Link>
        </div>
      </nav>

      <main id="top">
        <section className="hero">
          <div className="hero-left">
            <div className="hero-badge anim-1">
              Plataforma de Cuidado Inteligente
            </div>
            <h1 className="hero-h1 anim-2">
              Cuide com
              <br />
              <span className="accent">Zelo.</span>
              <br />
              Cuide com
              <br />
              Tecnologia.
            </h1>
            <p className="hero-p anim-3">
              A ZeloTech conecta famílias e instituições à tecnologia de cuidado
              que seus idosos merecem — monitoramento em tempo real, comunicação
              integrada e relatórios inteligentes.
            </p>
            <div className="hero-ctas anim-4">
              <Link to="/cadastro-instituicao" className="btn btn-navy btn-lg">
                Sou uma Instituição <span className="arrow">›</span>
              </Link>
              <Link to="/cadastro-familia" className="btn btn-teal btn-lg">
                Sou uma Família <span className="arrow">›</span>
              </Link>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-img-bg" />
            <div className="hero-img-overlay" />
            <div className="hero-stat">
              <div className="hero-stat-num">+3.200</div>
              <div className="hero-stat-label">idosos monitorados hoje</div>
            </div>

            <div className="hero-card-float card-2">
              <div className="card-float-label text-navy">📋 Medicação 14h</div>
              <div className="card-float-value card-status">✓ Administrada</div>
              <div className="card-float-sub">
                Registrado pelo cuidador • há 3 min
              </div>
            </div>
          </div>
        </section>

        <div className="logos-bar">
          <div className="logos-inner">
            <span className="logos-label">Parceiros e certificações</span>
            {partners.map((partner) => (
              <span className="logo-item" key={partner}>
                {partner}
              </span>
            ))}
          </div>
        </div>

        <section id="como-funciona" className="section-pad">
          <div className="container">
            <div className="how-grid">
              <div className="how-steps">
                <span className="overline">Sua jornada</span>
                <h2 className="section-h">Como começar a cuidar melhor?</h2>
                <p className="section-sub section-sub-spaced">
                  Em poucos passos, sua instituição ou família estará conectada
                  ao ecossistema ZeloTech de cuidado inteligente.
                </p>

                <div className="steps-list">
                  {howSteps.map((step, index) => (
                    <button
                      className="how-step"
                      key={step.title}
                      type="button"
                      onClick={() => setActiveStep(index)}
                    >
                      <span
                        className={`step-num ${activeStep === index ? "step-num-active" : "step-num-inactive"}`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="step-content">
                        <span className="step-title">{step.title}</span>
                        <span className="step-desc">{step.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="how-visual">
                <div className="how-visual-inner">
                  <div className="how-phone-mock">
                    <div className="phone-screen">
                      <div className="phone-header">ZeloTech · Dashboard</div>
                      <div className="phone-card">
                        <div className="phone-card-label">Pressão arterial</div>
                        <div className="phone-card-val">120/80</div>
                        <div className="phone-bar">
                          <div className="phone-bar-fill pressure-fill" />
                        </div>
                        <div className="phone-pill">Normal</div>
                      </div>
                      <div className="phone-card">
                        <div className="phone-card-label">
                          Frequência cardíaca
                        </div>
                        <div className="phone-card-val">72 bpm</div>
                        <div className="phone-bar">
                          <div className="phone-bar-fill heart-fill" />
                        </div>
                        <div className="phone-pill">Regular</div>
                      </div>
                      <div className="phone-card">
                        <div className="phone-card-label">Medicação 18h</div>
                        <div className="phone-card-val phone-confirmed">
                          ✓ Confirmada
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="app-caption">
                    App disponível para iOS e Android
                  </div>
                  <div className="store-buttons">
                    <div className="store-button">▶ App Store</div>
                    <div className="store-button">▶ Google Play</div>
                  </div>
                </div>
                <div className="blob blob-teal" />
                <div className="blob blob-navy" />
              </div>
            </div>
          </div>
        </section>

        <section className="numbers-section">
          <div className="container">
            <div className="numbers-grid">
              {numbers.map((item) => (
                <div
                  className="number-item"
                  key={`${item.value}${item.suffix}`}
                >
                  <div className="number-val">
                    {item.value}
                    <span>{item.suffix}</span>
                  </div>
                  <div className="number-label">
                    {item.label}
                    <br />
                    {item.labelBreak}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Benefits benefits={benefits} />
        <AudienceCards audiences={audiences} />
        <Faq items={faqItems} />
      </main>

      <footer>
        <div className="container">
          <div className="footer-top">
            <div>
              <a className="footer-logo" href="#top">
                Zelo<span>Tech</span>
              </a>
              <p className="footer-desc">
                Plataforma de cuidado inteligente para idosos. Conectando
                famílias e instituições com tecnologia e humanidade.
              </p>
              <div className="footer-store-buttons">
                <a href="#top">▶ App Store</a>
                <a href="#top">▶ Google Play</a>
              </div>
            </div>
            {footerColumns.map((column) => (
              <div key={column.title}>
                <div className="footer-col-title">{column.title}</div>
                <ul className="footer-links">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a href="#top">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">
              © 2025 ZeloTech Tecnologia Ltda. · CNPJ 00.000.000/0001-00 · Todos
              os direitos reservados
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default HomePage;
