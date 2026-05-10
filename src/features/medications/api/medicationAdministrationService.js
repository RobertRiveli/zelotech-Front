import { api } from "@/shared/api/client";

export async function listTodayMedicationAdministrations() {
  const data = await api.get("/medication-administrations/today");

  return data.data ?? [];
}
