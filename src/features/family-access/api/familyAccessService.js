import { api } from "@/shared/api/client";

export async function createResidentAccessCode(residentId, form) {
  return api.post(`/residents/${residentId}/access-codes`, {
    maxUses: Number(form.maxUses),
  });
}

export async function listResidentAccessCodes(residentId) {
  const data = await api.get(`/residents/${residentId}/access-codes`);

  return data.accessCodes ?? [];
}
