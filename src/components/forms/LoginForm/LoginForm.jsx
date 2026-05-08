import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../ui/Button";
import InputField from "../../ui/InputField";
import PasswordInput from "../../ui/PasswordInput";
import { login } from "../../../services/authService";
import { saveSession } from "../../../utils/storage";
import { CAREGIVER_FEATURE_PENDING_MESSAGE } from "../../../utils/accessMessages";
import { formatCpf } from "../../../utils/cpfFormatter";
import { validateLoginForm } from "../../../validations/loginSchema";
import styles from "./LoginForm.module.css";

const initialForm = {
  cpf: "",
  password: "",
};

function getLoginErrorMessage(error) {
  const hasCredentialError =
    error?.status === 400 &&
    (error?.errors?.cpf || error?.errors?.password || error?.errorType);

  if (hasCredentialError) {
    return "CPF ou senha inválidos.";
  }

  return "Não foi possível acessar sua conta. Tente novamente.";
}

function LoginForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [isNotice, setIsNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    const nextValue = name === "cpf" ? formatCpf(value) : value;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: nextValue,
    }));
    setFieldErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[name];
      return nextErrors;
    });
    setGlobalError("");
    setIsNotice(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validation = validateLoginForm(form);

    if (validation.globalError || Object.keys(validation.fieldErrors).length) {
      setFieldErrors(validation.fieldErrors);
      setGlobalError(validation.globalError);
      setIsNotice(false);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setGlobalError("");
    setIsNotice(false);

    try {
      const session = await login(form);

      if (!session?.token) {
        throw { status: 502 };
      }

      saveSession(session);

      if (session.user?.role === "admin") {
        navigate("/dashboard");
        return;
      }

      if (session.user?.role === "caregiver") {
        setGlobalError(CAREGIVER_FEATURE_PENDING_MESSAGE);
        setIsNotice(true);
        return;
      }

      setGlobalError("Não foi possível identificar seu perfil de acesso.");
      setIsNotice(false);
    } catch (error) {
      setGlobalError(getLoginErrorMessage(error));
      setIsNotice(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.intro}>
        <h2 className={styles.title}>Entrar na sua conta</h2>
        <p className={styles.subtitle}>
          Acesse o painel da sua instituição e acompanhe a gestão dos cuidados
          com segurança.
        </p>
      </div>

      {globalError ? (
        <div
          className={`${styles.alert} ${isNotice ? styles.notice : ""}`.trim()}
          role={isNotice ? "status" : "alert"}
        >
          {globalError}
        </div>
      ) : null}

      <InputField
        autoComplete="username"
        error={fieldErrors.cpf}
        id="cpf"
        inputMode="numeric"
        label="CPF"
        maxLength={14}
        name="cpf"
        onChange={handleChange}
        placeholder="000.000.000-00"
        value={form.cpf}
      />

      <PasswordInput
        autoComplete="current-password"
        error={fieldErrors.password}
        id="password"
        label="Senha"
        maxLength={128}
        name="password"
        onChange={handleChange}
        placeholder="Digite sua senha"
        value={form.password}
      />

      <Button
        fullWidth
        isLoading={isSubmitting}
        loadingLabel="Entrando..."
        type="submit"
      >
        Entrar
      </Button>

      <div className={styles.links}>
        <Link className={styles.link} to="/recuperar-senha">
          Esqueci minha senha
        </Link>
        <div className={styles.secondaryLinks}>
          <Link className={styles.link} to="/cadastro-empresa">
            Cadastrar empresa
          </Link>
          <Link className={styles.link} to="/cadastro-familia">
            Cadastrar Família
          </Link>
        </div>
      </div>
    </form>
  );
}

export default LoginForm;
