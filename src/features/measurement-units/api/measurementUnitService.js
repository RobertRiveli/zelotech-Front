import { api } from "@/shared/api/client";

export async function listMeasurementUnits() {
  const data = await api.get("/measurement-units");

  return data.data ?? [];
}
