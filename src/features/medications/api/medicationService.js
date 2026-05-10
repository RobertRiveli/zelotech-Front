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

export async function createMedication(form) {
  const data = await api.post("/medications", normalizeMedicationPayload(form));

  return data.medication;
}

export async function listMedications() {
  const data = await api.get("/medications");

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
