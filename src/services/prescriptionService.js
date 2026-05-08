import { api } from "./api";

export async function listPrescriptions() {
  const data = await api.get("/prescriptions");

  return data.prescriptions ?? [];
}
