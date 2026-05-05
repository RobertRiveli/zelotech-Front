import { Link, useNavigate } from "react-router-dom";
import { getUser, removeSession } from "../utils/storage";

function DashboardPage() {
  const navigate = useNavigate();
  const user = getUser();

  function handleLogout() {
    removeSession();
    navigate("/login", { replace: true });
  }

  return (
    <>
      <nav className="nav register-nav" aria-label="Navegação principal">
        <Link className="nav-logo" to="/" aria-label="ZeloTech">
          Zelo<span>Tech</span>
        </Link>
        <div className="nav-ctas">
          <button className="btn btn-outline-navy btn-sm" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </nav>

      <main className="company-register-page">
        <section className="register-hero">
          <div className="register-hero-copy">
            <span className="overline">Painel institucional</span>
            <h1 className="register-title">Painel da instituição</h1>
            <p className="register-subtitle">
              {user?.fullName
                ? `Olá, ${user.fullName}. Seu acesso ao painel foi iniciado com segurança.`
                : "Seu acesso ao painel foi iniciado com segurança."}
            </p>
          </div>
          <aside className="register-panel" aria-label="Sessão autenticada">
            <div className="register-panel-title">Sessão ativa</div>
            <ul className="register-panel-list">
              <li>Token salvo para próximas requisições autenticadas.</li>
              <li>
                Perfil de acesso: {user?.role === "admin" ? "admin" : "usuário"}
              </li>
              <li>Base pronta para receber os módulos de gestão.</li>
            </ul>
          </aside>
        </section>
      </main>
    </>
  );
}

export default DashboardPage;
