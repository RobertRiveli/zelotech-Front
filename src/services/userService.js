import { api } from "./api";

export async function getProfile() {
  return api.get("/users/profile");
}
