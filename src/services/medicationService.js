import { api } from "./api";

export async function listMedications() {
  const data = await api.get("/medications");

  return data.medications ?? [];
}
