import { api } from "@/shared/api/client";
import { parseBrazilianDateTime } from "@/features/medication-administrations/utils/administrationForms";

export async function listTodayMedicationAdministrations() {
  const data = await api.get("/medication-administrations/today");

  return data.data ?? [];
}

export async function getMedicationAdministrationById(id) {
  const data = await api.get(`/medication-administrations/${id}`);

  return data.data;
}

export async function administerMedicationAdministration(id, form = {}) {
  const data = await api.patch(
    `/medication-administrations/${id}/administer`,
    {
      administeredAt: toOptionalIsoDateTime(form.administeredAt),
      notes: normalizeOptionalText(form.notes),
    },
  );

  return data.data;
}

export async function refuseMedicationAdministration(id, form) {
  const data = await api.patch(
    `/medication-administrations/${id}/refuse`,
    normalizeReasonPayload(form),
  );

  return data.data;
}

export async function missMedicationAdministration(id, form) {
  const data = await api.patch(
    `/medication-administrations/${id}/miss`,
    normalizeReasonPayload(form),
  );

  return data.data;
}

export async function cancelMedicationAdministration(id, form) {
  const data = await api.patch(
    `/medication-administrations/${id}/cancel`,
    normalizeReasonPayload(form),
  );

  return data.data;
}

export async function createManualMedicationAdministration(form) {
  const data = await api.post("/medication-administrations/manual", {
    prescriptionId: form.prescriptionId,
    residentId: form.residentId,
    scheduledAt: toIsoDateTime(form.scheduledAt),
    notes: normalizeOptionalText(form.notes),
  });

  return data.data;
}

function normalizeReasonPayload(form) {
  return {
    reason: form.reason.trim(),
    notes: normalizeOptionalText(form.notes),
  };
}

function normalizeOptionalText(value) {
  return value?.trim() || undefined;
}

function toOptionalIsoDateTime(value) {
  return value ? toIsoDateTime(value) : undefined;
}

function toIsoDateTime(value) {
  const brazilianDate = parseBrazilianDateTime(value);

  return (brazilianDate ?? new Date(value)).toISOString();
}
