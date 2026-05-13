import { useEffect, useState } from "react";
import { maskCpf } from "@/shared/utils/cpfFormatter";
import { FieldError } from "@/shared/ui/FieldError";

const genderOptions = [
  { label: "Feminino", value: "F" },
  { label: "Masculino", value: "M" },
  { label: "Outro", value: "other" },
];

const bloodTypeOptions = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

export function ResidentForm({
  errors,
  form,
  isSubmitting,
  maskCpfField = false,
  onCancel,
  onChange,
  onSubmit,
  submitLabel = "Salvar residente",
  submitError,
}) {
  const [isCpfVisible, setIsCpfVisible] = useState(!maskCpfField);

  useEffect(() => {
    setIsCpfVisible(!maskCpfField);
  }, [maskCpfField]);

  return (
    <form className="dashboard-form" onSubmit={onSubmit}>
      {submitError ? (
        <div
          className="dashboard-form-alert dashboard-form-alert-danger"
          role="status"
        >
          {submitError}
        </div>
      ) : null}

      <div className="dashboard-form-grid">
        <label className="dashboard-field">
          <span>Nome completo</span>
          <input
            name="fullName"
            placeholder="Maria Aparecida Souza"
            value={form.fullName}
            onChange={onChange}
          />
          <FieldError message={errors.fullName || errors.resident} />
        </label>

        <label className="dashboard-field">
          <span>CPF</span>
          <div className="resident-cpf-field-control">
            <input
              inputMode="numeric"
              name="cpf"
              placeholder="000.000.000-00"
              readOnly={maskCpfField && !isCpfVisible}
              value={maskCpfField && !isCpfVisible ? maskCpf(form.cpf) : form.cpf}
              onChange={maskCpfField && !isCpfVisible ? undefined : onChange}
            />
            {maskCpfField ? (
              <button
                aria-label={isCpfVisible ? "Ocultar CPF" : "Revelar CPF"}
                aria-pressed={isCpfVisible}
                className="resident-sensitive-toggle resident-cpf-toggle"
                type="button"
                onClick={() => setIsCpfVisible((currentValue) => !currentValue)}
              >
                {isCpfVisible ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            ) : null}
          </div>
          <FieldError message={errors.cpf} />
        </label>

        <label className="dashboard-field">
          <span>Nascimento</span>
          <input
            name="birthDate"
            type="date"
            value={form.birthDate}
            onChange={onChange}
          />
          <FieldError message={errors.birthDate} />
        </label>

        <label className="dashboard-field">
          <span>Admissão</span>
          <input
            name="admissionDate"
            type="date"
            value={form.admissionDate}
            onChange={onChange}
          />
          <FieldError message={errors.admissionDate} />
        </label>

        <label className="dashboard-field">
          <span>Gênero</span>
          <select name="gender" value={form.gender} onChange={onChange}>
            <option value="">Selecione</option>
            {genderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError message={errors.gender} />
        </label>

        <label className="dashboard-field">
          <span>Tipo sanguíneo</span>
          <select name="bloodType" value={form.bloodType} onChange={onChange}>
            <option value="">Selecione</option>
            {bloodTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <FieldError message={errors.bloodType} />
        </label>
      </div>

      <div className="dashboard-form-actions">
        <button
          className="dashboard-button dashboard-button-muted"
          disabled={isSubmitting}
          type="button"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          className="dashboard-button dashboard-button-primary"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="resident-sensitive-toggle-icon"
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      className="resident-sensitive-toggle-icon"
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path
        d="m3 3 18 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M10.6 5.2A10.5 10.5 0 0 1 12 5c6 0 9.5 7 9.5 7a17.3 17.3 0 0 1-3.1 4.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M14.1 14.1A3 3 0 0 1 9.9 9.9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M6.6 6.7C3.9 8.5 2.5 12 2.5 12s3.5 7 9.5 7c1.5 0 2.9-.4 4.1-1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
