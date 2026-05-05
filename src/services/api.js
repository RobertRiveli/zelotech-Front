import { getToken } from "../utils/storage";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function getBaseUrl() {
  if (!API_BASE_URL) {
    throw {
      errorType: "CONFIGURATION_ERROR",
      message: "A variável VITE_API_URL não foi configurada.",
    };
  }

  return API_BASE_URL.replace(/\/$/, "");
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

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers,
  });
  const data = await readResponseBody(response);

  if (!response.ok) {
    throw {
      errorType: data.errorType ?? "REQUEST_ERROR",
      message: data.message ?? "Não foi possível concluir a solicitação.",
      errors: data.errors ?? {},
      status: response.status,
    };
  }

  return data;
}

export const api = {
  get(path, options) {
    return request(path, { ...options, method: "GET" });
  },
  post(path, body, options) {
    return request(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};
