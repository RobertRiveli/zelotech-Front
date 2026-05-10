import { createConfigurationError, createRequestError } from "./errors";

const API_BASE_URL = import.meta.env.VITE_API_URL;
let getAuthorizationToken = () => "";

export function configureApiClient({ getToken } = {}) {
  getAuthorizationToken = typeof getToken === "function" ? getToken : () => "";
}

function getBaseUrl() {
  if (!API_BASE_URL) {
    throw createConfigurationError("A variável VITE_API_URL não foi configurada.");
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
  const token = getAuthorizationToken();
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
    throw createRequestError(data, response.status);
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
  patch(path, body, options) {
    return request(path, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  put(path, body, options) {
    return request(path, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  delete(path, options) {
    return request(path, { ...options, method: "DELETE" });
  },
};
