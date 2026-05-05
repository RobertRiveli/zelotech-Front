const TOKEN_KEY = "accessToken";
const USER_KEY = "user";

export function saveSession(session) {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function hasSession() {
  return Boolean(getToken());
}

export function getUser() {
  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    removeSession();
    return null;
  }
}

export function getUserRole() {
  return getUser()?.role ?? "";
}

export function hasAdminSession() {
  return Boolean(getToken()) && getUserRole() === "admin";
}

export function hasCaregiverSession() {
  return Boolean(getToken()) && getUserRole() === "caregiver";
}

export function removeSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
