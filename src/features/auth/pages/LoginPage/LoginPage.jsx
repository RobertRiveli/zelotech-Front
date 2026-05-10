import { Link } from "react-router-dom";
import LoginForm from "@/features/auth/components/LoginForm";
import styles from "./LoginPage.module.css";

function LoginPage() {
  return (
    <>
      <nav
        className={`nav register-nav ${styles.nav}`}
        aria-label="Navegação principal"
      >
        <Link className="nav-logo" to="/" aria-label="ZeloTech">
          Zelo<span>Tech</span>
        </Link>
        <div className="nav-ctas">
          <Link className="btn btn-outline-navy btn-sm" to="/">
            Voltar ao site
          </Link>
          <Link className="btn btn-navy btn-sm" to="/cadastro-empresa">
            Cadastrar empresa
          </Link>
        </div>
      </nav>

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.copy}>
            <span className="overline">Login institucional</span>
            <h1 className={styles.title}>Entrar na sua conta</h1>
            <p className={styles.subtitle}>
              Acesse o painel da sua instituição e acompanhe a gestão dos
              cuidados com segurança.
            </p>
            <p className={styles.institutional}>
              Gestão simples, segura e humanizada para instituições de cuidado.
            </p>
          </div>

          <aside className={styles.panel} aria-label="Formulário de login">
            <LoginForm />
          </aside>
        </section>
      </main>
    </>
  );
}

export default LoginPage;
