import {
  formatCnpj,
  formatPhone,
  onlyNumbers,
} from "@/shared/utils/documentFormatter";

export const editableCompanyFields = [
  "legalName",
  "tradeName",
  "taxId",
  "email",
  "phone",
];

export function createEmptyCompanyForm() {
  return {
    legalName: "",
    tradeName: "",
    taxId: "",
    email: "",
    phone: "",
  };
}

export function createCompanyFormFromCompany(company) {
  return {
    legalName: company?.legalName ?? "",
    tradeName: company?.tradeName ?? "",
    taxId: company?.taxId ? formatCnpj(company.taxId) : "",
    email: company?.email ?? "",
    phone: company?.phone ? formatPhone(company.phone) : "",
  };
}

export function formatCompanyFieldValue(name, value) {
  if (name === "taxId") {
    return formatCnpj(value);
  }

  if (name === "phone") {
    return formatPhone(value);
  }

  return value;
}

export function normalizeCompanyForm(form) {
  return {
    legalName: form.legalName.trim(),
    tradeName: form.tradeName.trim(),
    taxId: onlyNumbers(form.taxId),
    email: form.email.trim().toLowerCase(),
    phone: onlyNumbers(form.phone),
  };
}

export function buildCompanyUpdatePayload(form, initialForm) {
  const normalizedForm = normalizeCompanyForm(form);
  const normalizedInitialForm = normalizeCompanyForm(initialForm);

  return editableCompanyFields.reduce((payload, field) => {
    if (normalizedForm[field] !== normalizedInitialForm[field]) {
      payload[field] = normalizedForm[field];
    }

    return payload;
  }, {});
}
