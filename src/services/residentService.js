import { api } from "./api";

export async function listResidents() {
  const data = await api.get("/residents");

  return data.residents ?? [];
}
