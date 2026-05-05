const API_BASE_URL = import.meta.env.VITE_API_URL;

function onlyNumbers(value) {
  return value.replace(/\D/g, "");
}

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

async function readResponseBody(response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return {};
  }

  try {
    return await response.json();
  } catch {
    return {};
  }
}

function getCompaniesEndpoint() {
  return `${API_BASE_URL.replace(/\/$/, "")}/companies`;
}

export async function registerCompany(form) {
  if (!API_BASE_URL) {
    throw {
      errorType: "CONFIGURATION_ERROR",
      message: "A variável VITE_API_URL não foi configurada.",
    };
  }

  const response = await fetch(getCompaniesEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(normalizeCompanyPayload(form)),
  });

  const data = await readResponseBody(response);

  if (!response.ok) {
    throw {
      errorType: data.errorType ?? "REQUEST_ERROR",
      message: data.message ?? "Não foi possível cadastrar a empresa.",
      errors: data.errors ?? {},
      status: response.status,
    };
  }

  return data.company;
}
