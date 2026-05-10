import { api } from "@/shared/api/client";

export async function listMedications() {
  const data = await api.get("/medications");

  return data.medications ?? [];
}
