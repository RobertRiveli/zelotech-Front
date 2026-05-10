import { api } from "@/shared/api/client";

const toIsoDateTime = ({ date, time = "00:00" }) => {
  if (!date) {
    return "";
  }

  return new Date(`${date}T${time}:00`).toISOString();
};

export function normalizePrescriptionPayload(form) {
  return {
    residentId: form.residentId,
    medicationId: form.medicationId,
    measurementUnitId: form.measurementUnitId,
    dosage: form.dosage.trim(),
    route: form.route.trim(),
    frequency: form.frequency.trim(),
    intervalHours: Number(form.intervalHours),
    firstScheduledAt: toIsoDateTime({
      date: form.firstScheduledDate,
      time: form.firstScheduledTime,
    }),
    prescribedBy: form.prescribedBy.trim(),
    startDate: toIsoDateTime({ date: form.startDate }),
    endDate: form.endDate
      ? toIsoDateTime({ date: form.endDate, time: "23:59" })
      : undefined,
  };
}

export function normalizePrescriptionUpdatePayload(form) {
  return {
    ...normalizePrescriptionPayload(form),
    endDate: form.endDate
      ? toIsoDateTime({ date: form.endDate, time: "23:59" })
      : null,
  };
}

export async function createPrescription(form) {
  const data = await api.post("/prescriptions", normalizePrescriptionPayload(form));

  return data.data;
}

export async function listPrescriptions() {
  const data = await api.get("/prescriptions");

  return data.prescriptions ?? [];
}

export async function listPrescriptionsByResident(residentId) {
  const data = await api.get(`/residents/${residentId}/prescriptions`);

  return data.prescriptions ?? [];
}

export async function getPrescriptionById(id) {
  const data = await api.get(`/prescriptions/${id}`);

  return data.prescription;
}

export async function updatePrescription(id, form) {
  const data = await api.patch(
    `/prescriptions/${id}`,
    normalizePrescriptionUpdatePayload(form),
  );

  return data.prescription;
}

export async function deactivatePrescription(id) {
  const data = await api.delete(`/prescriptions/${id}`);

  return data.prescription;
}
