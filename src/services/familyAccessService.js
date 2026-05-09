import { api } from "./api";

export async function createResidentAccessCode(residentId, form) {
  return api.post(`/residents/${residentId}/access-codes`, {
    maxUses: Number(form.maxUses),
  });
}
