import { api } from "@/shared/api/client";

const emptyToUndefined = (value) => {
  const normalized = value?.trim();

  return normalized ? normalized : undefined;
};

const emptyToNull = (value) => {
  const normalized = value?.trim();

  return normalized ? normalized : null;
};

export function normalizeMedicationPayload(form) {
  return {
    genericName: form.genericName.trim(),
    brandName: emptyToUndefined(form.brandName),
    form: form.form.trim(),
    strength: emptyToUndefined(form.strength),
  };
}

export function normalizeMedicationUpdatePayload(form) {
  return {
    genericName: form.genericName.trim(),
    brandName: emptyToNull(form.brandName),
    form: form.form.trim(),
    strength: emptyToNull(form.strength),
  };
}

function buildMedicationQuery(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    const normalized = typeof value === "string" ? value.trim() : value;

    if (normalized) {
      params.set(key, normalized);
    }
  });

  const query = params.toString();

  return query ? `?${query}` : "";
}

export async function createMedication(form) {
  const data = await api.post("/medications", normalizeMedicationPayload(form));

  return data.medication;
}

export async function listMedications(filters = {}) {
  const data = await api.get(`/medications${buildMedicationQuery(filters)}`);

  return data.medications ?? [];
}

export async function getMedicationById(id) {
  const data = await api.get(`/medications/${id}`);

  return data.medication;
}

export async function updateMedication(id, form) {
  const data = await api.put(
    `/medications/${id}`,
    normalizeMedicationUpdatePayload(form),
  );

  return data.medication;
}

export async function deleteMedication(id) {
  const data = await api.delete(`/medications/${id}`);

  return data.medication;
}
