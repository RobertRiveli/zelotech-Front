import { api } from "@/shared/api/client";

export async function getProfile() {
  return api.get("/users/profile");
}

export async function listUsers() {
  const data = await api.get("/users");

  return data.users ?? [];
}
