import {
  getStorageItem,
  removeStorageItem,
  setStorageItem,
} from "@/shared/utils/storage";

const TOKEN_KEY = "accessToken";
const USER_KEY = "user";

export function saveSession(session) {
  setStorageItem(TOKEN_KEY, session.token);
  setStorageItem(USER_KEY, JSON.stringify(session.user));
}

export function getToken() {
  return getStorageItem(TOKEN_KEY);
}

export function hasSession() {
  return Boolean(getToken());
}

export function getUser() {
  const storedUser = getStorageItem(USER_KEY);

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
  removeStorageItem(TOKEN_KEY);
  removeStorageItem(USER_KEY);
}
