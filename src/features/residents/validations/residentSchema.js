import { isValidCpf, onlyNumbers } from "@/shared/utils/cpfFormatter";

export function validateResidentForm(form) {
  const errors = {};
  const fullName = form.fullName.trim();
  const cpf = onlyNumbers(form.cpf);

  if (fullName.length < 3) {
    errors.fullName = "Informe um nome com pelo menos 3 caracteres.";
  }

  if (fullName.length > 160) {
    errors.fullName = "Use no máximo 160 caracteres.";
  }

  if (cpf && !isValidCpf(cpf)) {
    errors.cpf = "Informe um CPF válido.";
  }

  if (!form.birthDate) {
    errors.birthDate = "Informe a data de nascimento.";
  }

  if (!form.admissionDate) {
    errors.admissionDate = "Informe a data de admissão.";
  }

  return errors;
}
