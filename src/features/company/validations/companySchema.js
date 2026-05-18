import { isValidCnpj, onlyNumbers } from "@/shared/utils/documentFormatter";

function hasEmailShape(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function validateCompanyProfileForm(form) {
  const errors = {};
  const legalName = form.legalName.trim();
  const tradeName = form.tradeName.trim();
  const taxId = onlyNumbers(form.taxId);
  const phone = onlyNumbers(form.phone);

  if (legalName.length < 3) {
    errors.legalName = "Informe uma razão social com pelo menos 3 caracteres.";
  } else if (legalName.length > 160) {
    errors.legalName = "A razão social deve ter no máximo 160 caracteres.";
  }

  if (tradeName.length < 2) {
    errors.tradeName = "Informe um nome fantasia com pelo menos 2 caracteres.";
  } else if (tradeName.length > 160) {
    errors.tradeName = "O nome fantasia deve ter no máximo 160 caracteres.";
  }

  if (taxId.length !== 14) {
    errors.taxId = "Informe um CNPJ com 14 dígitos.";
  } else if (!isValidCnpj(taxId)) {
    errors.taxId = "Informe um CNPJ válido.";
  }

  if (!hasEmailShape(form.email)) {
    errors.email = "Informe um e-mail válido.";
  }

  if (phone.length < 10 || phone.length > 11) {
    errors.phone = "Informe um telefone brasileiro válido.";
  }

  return errors;
}
