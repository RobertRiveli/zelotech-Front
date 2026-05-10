import { api } from "@/shared/api/client";
import { onlyNumbers } from "@/shared/utils/documentFormatter";

function normalizeCompanyPayload(form) {
  return {
    legalName: form.legalName.trim(),
    tradeName: form.tradeName.trim(),
    taxId: onlyNumbers(form.taxId),
    email: form.email.trim().toLowerCase(),
    phone: onlyNumbers(form.phone),
    admin: {
      fullName: form.adminFullName.trim(),
      email: form.adminEmail.trim().toLowerCase(),
      phone: onlyNumbers(form.adminPhone),
      cpf: onlyNumbers(form.adminCpf),
      password: form.adminPassword,
    },
  };
}

export async function registerCompany(form) {
  const data = await api.post("/companies", normalizeCompanyPayload(form));

  return data.company;
}
