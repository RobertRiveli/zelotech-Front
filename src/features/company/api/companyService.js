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

function normalizeCompanyUpdatePayload(form) {
  const payload = {};

  if ("legalName" in form) {
    payload.legalName = form.legalName?.trim();
  }

  if ("tradeName" in form) {
    payload.tradeName = form.tradeName?.trim();
  }

  if ("taxId" in form) {
    payload.taxId = onlyNumbers(form.taxId);
  }

  if ("email" in form) {
    payload.email = form.email?.trim().toLowerCase();
  }

  if ("phone" in form) {
    payload.phone = onlyNumbers(form.phone);
  }

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  return payload;
}

export async function registerCompany(form) {
  const data = await api.post("/companies", normalizeCompanyPayload(form));

  return data.company;
}

export async function getCompany() {
  const data = await api.get("/companies");

  return data.company;
}

export async function updateCompany(form) {
  const data = await api.patch("/companies", normalizeCompanyUpdatePayload(form));

  return data.company;
}
