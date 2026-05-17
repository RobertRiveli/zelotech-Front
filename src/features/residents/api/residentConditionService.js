import { api } from "@/shared/api/client";

export async function listHealthConditions() {
  const data = await api.get("/health-conditions");

  return data.conditions ?? [];
}

export async function createResidentCondition(form) {
  const data = await api.post(
    "/resident-conditions",
    normalizeResidentConditionPayload(form),
  );

  return data.residentCondition;
}

export async function listResidentConditions(residentId) {
  const data = await api.get(`/residents/${residentId}/conditions`);

  return data.healthConditions ?? [];
}

export async function deleteResidentCondition(id) {
  const data = await api.delete(`/resident-conditions/${id}`);

  return data.residentCondition;
}

function normalizeResidentConditionPayload(form) {
  return {
    residentId: form.residentId,
    healthConditionId: form.healthConditionId,
    observations: normalizeOptionalText(form.observations),
  };
}

function normalizeOptionalText(value) {
  return value?.trim() || undefined;
}
