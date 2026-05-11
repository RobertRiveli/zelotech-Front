import { FieldError } from "@/shared/ui/FieldError";

const genderOptions = [
  { label: "Feminino", value: "female" },
  { label: "Masculino", value: "male" },
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
  onCancel,
  onChange,
  onSubmit,
  submitError,
}) {
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
          <input
            inputMode="numeric"
            name="cpf"
            placeholder="000.000.000-00"
            value={form.cpf}
            onChange={onChange}
          />
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
          {isSubmitting ? "Salvando..." : "Salvar residente"}
        </button>
      </div>
    </form>
  );
}
