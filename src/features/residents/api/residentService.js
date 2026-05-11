import { api } from "@/shared/api/client";
import { normalizeResidentPayload } from "@/features/residents/utils/residentForm";

export async function createResident(form) {
  const data = await api.post("/residents", normalizeResidentPayload(form));

  return data.resident;
}

export async function listResidents() {
  const data = await api.get("/residents");

  return data.residents ?? [];
}

export async function getResidentOverview(residentId) {
  const data = await api.get(`/residents/${residentId}/overview`);

  return data.residentOverview;
}
