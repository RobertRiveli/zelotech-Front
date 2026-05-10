import { api } from "@/shared/api/client";

export async function listResidents() {
  const data = await api.get("/residents");

  return data.residents ?? [];
}

export async function getResidentOverview(residentId) {
  const data = await api.get(`/residents/${residentId}/overview`);

  return data.residentOverview;
}
