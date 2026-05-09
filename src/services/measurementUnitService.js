import { api } from "./api";

export async function listMeasurementUnits() {
  const data = await api.get("/measurement-units");

  return data.data ?? [];
}
