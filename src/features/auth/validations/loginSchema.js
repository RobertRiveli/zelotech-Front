import { isValidCpf, onlyNumbers } from "@/shared/utils/cpfFormatter";

export function validateLoginForm(form) {
  const errors = {};
  const cpf = onlyNumbers(form.cpf);

  if (!form.cpf.trim() || !form.password) {
    return {
      fieldErrors: errors,
      globalError: "Preencha todos os campos obrigatórios.",
    };
  }

  if (cpf.length !== 11 || !isValidCpf(cpf)) {
    errors.cpf = "Informe um CPF válido.";
  }

  return {
    fieldErrors: errors,
    globalError: errors.cpf ? "Informe um CPF válido." : "",
  };
}
