import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoginForm from "@/features/auth/components/LoginForm";
import styles from "./LoginPage.module.css";

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const toastMessage = location.state?.authMessage ?? "";

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      navigate(location.pathname, { replace: true, state: null });
    }, 4500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [location.pathname, navigate, toastMessage]);

  function dismissToast() {
    navigate(location.pathname, { replace: true, state: null });
  }

  return (
    <>
      {toastMessage ? (
        <div className={styles.toast} role="status" aria-live="polite">
          <div className={styles.toastMark} aria-hidden="true">
            !
          </div>
          <div className={styles.toastContent}>
            <strong>{toastMessage}</strong>
            <span>Faça login novamente para continuar.</span>
          </div>
          <button
            className={styles.toastClose}
            type="button"
            onClick={dismissToast}
            aria-label="Fechar aviso"
          >
            x
          </button>
        </div>
      ) : null}

      <nav
        className={`nav register-nav ${styles.nav}`}
        aria-label="Navegação principal"
      >
        <Link className="nav-logo" to="/" aria-label="ZeloTech">
          Zelo<span>Tech</span>
        </Link>
      </nav>

      <main className={styles.page}>
        <section className={styles.hero}>
          <aside className={styles.panel} aria-label="Formulário de login">
            <LoginForm />
          </aside>
        </section>
      </main>
    </>
  );
}

export default LoginPage;
