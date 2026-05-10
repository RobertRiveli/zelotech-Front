import { api } from "@/shared/api/client";

export async function getProfile() {
  return api.get("/users/profile");
}
